import { BasicIndex, createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { persistedCollectionOptions } from "@tanstack/expo-db-sqlite-persistence";
import { parseLoadSubsetOptions } from "@tanstack/db";

import { api } from "@/api";
import type { EntryStatus } from "@/api/types";
import type { EntryRow } from "@/collections/schemas";
import { getCoverImage } from "@/lib/cover-image";
import { createPersistence } from "@/lib/persistence";
import { queryClient } from "@/lib/query-client";

/**
 * Entry detail collection.
 *
 * Stores the full entry including `content` (large HTML body). Each entry
 * is fetched individually by ID via `GET /v1/entries/{id}` when a detail
 * view subscribes with `eq(id, entryId)`.
 *
 * Uses `syncMode: "on-demand"` so only entries actively being viewed are
 * loaded from SQLite into memory. Persisted separately from the list
 * collection to keep list queries lightweight.
 */
const queryOptions = queryCollectionOptions({
  id: "entry-details",
  queryKey: ["entry-details"],
  queryClient,
  syncMode: "on-demand",
  getKey: (entry: EntryRow) => entry.id,
  onUpdate: async ({ transaction }) => {
    const statusChanges = transaction.mutations.filter(
      (m) => m.changes.status != null,
    );
    if (statusChanges.length > 0) {
      await api.updateEntries({
        entry_ids: statusChanges.map((m) => m.original.id),
        status: statusChanges[0]!.changes.status as EntryStatus,
      });
    }

    const starredChanges = transaction.mutations.filter(
      (m) => m.changes.starred != null,
    );
    for (const m of starredChanges) {
      await api.toggleBookmark(m.original.id);
    }
  },
  queryFn: async (ctx): Promise<EntryRow[]> => {
    const { filters } = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);

    const idFilter = filters.find(
      (f) => f.field.length === 1 && f.field[0] === "id" && f.operator === "eq",
    );
    if (!idFilter) {
      return [];
    }

    const entryId = idFilter.value as number;
    const entry = await api.getEntry(entryId, ctx.signal);

    return [
      {
        ...entry,
        cover_image_url: getCoverImage(entry.enclosures, entry.content),
      } as EntryRow,
    ];
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<EntryRow, number>(),
  schemaVersion: 1,
});

export const entryDetailCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
  autoIndex: "eager",
  defaultIndexType: BasicIndex,
});
