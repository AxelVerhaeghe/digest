import { BasicIndex, createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { persistedCollectionOptions } from "@tanstack/expo-db-sqlite-persistence";

import { api } from "@/api";
import { queryClient } from "@/lib/query-client";
import { createPersistence } from "@/lib/persistence";
import { getCoverImage } from "@/hooks/use-entries";
import type { EntryRow } from "@/collections/schemas";

/** Number of entries to fetch per page during sync. */
const PAGE_SIZE = 100;

/**
 * Maximum number of entries to sync in total. Acts as a safety cap to
 * avoid unbounded fetching for accounts with very large histories.
 * Adjust as needed -- 5 000 entries is roughly 6-12 months for a
 * moderate number of subscriptions.
 */
const MAX_ENTRIES = 5_000;

/**
 * Fetch all entries from Miniflux by paginating through `GET /v1/entries`.
 *
 * Stops when either:
 * - All entries have been fetched (`offset >= total`), or
 * - The safety cap ({@link MAX_ENTRIES}) is reached, or
 * - The request is aborted via `signal`.
 */
async function fetchAllEntries(signal?: AbortSignal): Promise<EntryRow[]> {
  const allEntries: EntryRow[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total && allEntries.length < MAX_ENTRIES) {
    if (signal?.aborted) break;

    const response = await api.getEntries(
      {
        order: "published_at",
        direction: "desc",
        limit: PAGE_SIZE,
        offset,
      },
      signal,
    );

    total = response.total;
    const enriched = response.entries.map((entry) => ({
      ...entry,
      cover_image_url: getCoverImage(entry.enclosures, entry.content),
    }));
    allEntries.push(...enriched);
    offset += PAGE_SIZE;

    // If we got fewer than PAGE_SIZE, we've exhausted the results.
    if (response.entries.length < PAGE_SIZE) break;
  }

  return allEntries;
}

/**
 * Entries collection.
 *
 * Syncs with Miniflux `GET /v1/entries` using paginated fetching and
 * persists locally in SQLite. The full entry set is fetched on each sync
 * so the local store is always complete (up to {@link MAX_ENTRIES}).
 *
 * Mutation handlers for read/unread and bookmark toggling will be added
 * in Phase 3 (optimistic mutations).
 */
const queryOptions = queryCollectionOptions({
  id: "entries",
  queryKey: ["entries"],
  queryClient,
  getKey: (entry: EntryRow) => entry.id,
  queryFn: async ({ signal }): Promise<EntryRow[]> => {
    return fetchAllEntries(signal);
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<EntryRow, number>(),
  schemaVersion: 2,
});

export const entriesCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
  autoIndex: "eager",
  defaultIndexType: BasicIndex,
});
