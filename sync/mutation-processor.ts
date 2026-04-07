import { eq, asc } from "drizzle-orm";

import { api } from "@/api";
import { ApiError } from "@/api/errors";
import type { EntryStatus } from "@/api/types";
import { db } from "@/db/database";
import { pendingMutations } from "@/db/schema";
import { invalidateEntries } from "@/db/invalidate";

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

/**
 * Flush all pending mutations to the Miniflux API.
 *
 * Processes mutations in FIFO order. Status changes for the same target
 * status are batched into a single API call (Miniflux accepts multiple
 * entry IDs per status update). Bookmark toggles are sent individually.
 *
 * On network failure, processing stops and remaining mutations stay queued.
 * On API error (4xx), the mutation is discarded (server rejected it).
 */
export async function flushMutationQueue(): Promise<void> {
  const pending = await db
    .select()
    .from(pendingMutations)
    .orderBy(asc(pendingMutations.created_at));

  if (pending.length === 0) return;

  const statusBatches = new Map<
    EntryStatus,
    { ids: number[]; rowIds: number[] }
  >();
  const bookmarkMutations: { entryId: number; rowId: number }[] = [];

  for (const row of pending) {
    const { payload } = row;

    if (row.type === "status_change" && "status" in payload) {
      const existing = statusBatches.get(payload.status);
      if (existing) {
        existing.ids.push(row.entry_id);
        existing.rowIds.push(row.id);
      } else {
        statusBatches.set(payload.status, {
          ids: [row.entry_id],
          rowIds: [row.id],
        });
      }
    } else if (row.type === "toggle_bookmark") {
      bookmarkMutations.push({ entryId: row.entry_id, rowId: row.id });
    }
  }

  for (const [status, batch] of statusBatches) {
    try {
      await api.updateEntries({ entry_ids: batch.ids, status });
      for (const rowId of batch.rowIds) {
        await db.delete(pendingMutations).where(eq(pendingMutations.id, rowId));
      }
    } catch (error: unknown) {
      if (isClientError(error)) {
        for (const rowId of batch.rowIds) {
          await db
            .delete(pendingMutations)
            .where(eq(pendingMutations.id, rowId));
        }
      } else {
        return;
      }
    }
  }

  for (const mutation of bookmarkMutations) {
    try {
      await api.toggleBookmark(mutation.entryId);
      await db
        .delete(pendingMutations)
        .where(eq(pendingMutations.id, mutation.rowId));
    } catch (error: unknown) {
      if (isClientError(error)) {
        await db
          .delete(pendingMutations)
          .where(eq(pendingMutations.id, mutation.rowId));
      } else {
        return;
      }
    }
  }

  invalidateEntries();
}
