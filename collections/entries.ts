import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { persistedCollectionOptions } from '@tanstack/expo-db-sqlite-persistence';

import { api } from '@/api';
import { queryClient } from '@/lib/query-client';
import { createPersistence } from '@/lib/persistence';
import type { EntryRow } from '@/collections/schemas';

/**
 * Entries collection.
 *
 * Syncs with Miniflux `GET /v1/entries` and persists locally in SQLite.
 *
 * The Miniflux entries endpoint returns `{ total, entries }`. The `queryFn`
 * extracts the `entries` array so the collection receives a flat list.
 *
 * Mutation handlers for read/unread and bookmark toggling will be added
 * in Phase 3 (optimistic mutations).
 */
const queryOptions = queryCollectionOptions({
  id: 'entries',
  queryKey: ['entries'],
  queryClient,
  getKey: (entry: EntryRow) => entry.id,
  queryFn: async ({ signal }): Promise<EntryRow[]> => {
    const response = await api.getEntries(
      { order: 'published_at', direction: 'desc', limit: 100 },
      signal,
    );
    return response.entries;
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<EntryRow, number>(),
  schemaVersion: 1,
});

export const entriesCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
});
