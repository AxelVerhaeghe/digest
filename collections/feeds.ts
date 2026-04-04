import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { persistedCollectionOptions } from '@tanstack/expo-db-sqlite-persistence';

import { api } from '@/api';
import { queryClient } from '@/lib/query-client';
import { createPersistence } from '@/lib/persistence';
import type { FeedRow } from '@/collections/schemas';

/**
 * Feeds collection.
 *
 * Syncs with Miniflux `GET /v1/feeds` and persists locally in SQLite.
 * Feed management (subscribe/unsubscribe) happens through the Miniflux
 * API -- the local collection is read-only for now.
 */
const queryOptions = queryCollectionOptions({
  id: 'feeds',
  queryKey: ['feeds'],
  queryClient,
  getKey: (feed: FeedRow) => feed.id,
  queryFn: async ({ signal }): Promise<FeedRow[]> => {
    return api.getFeeds(signal);
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<FeedRow, number>(),
  schemaVersion: 1,
});

export const feedsCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
});
