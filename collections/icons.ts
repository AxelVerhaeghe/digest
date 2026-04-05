import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { persistedCollectionOptions } from "@tanstack/expo-db-sqlite-persistence";

import { api } from "@/api";
import { queryClient } from "@/lib/query-client";
import { createPersistence } from "@/lib/persistence";
import type { IconRow } from "@/collections/schemas";

/**
 * Feed icons collection.
 *
 * Syncs icon data (base-64 encoded favicons) for all subscribed feeds.
 * The `queryFn` fetches the feed list to discover which icons exist, then
 * fetches each icon individually via `GET /v1/icons/{id}`.
 *
 * Icons are small and rarely change, so eager sync mode is used -- the
 * full set is loaded at startup alongside feeds and categories.
 */
const queryOptions = queryCollectionOptions({
  id: "icons",
  queryKey: ["icons"],
  queryClient,
  getKey: (icon: IconRow) => icon.id,
  queryFn: async ({ signal }): Promise<IconRow[]> => {
    const feeds = await api.getFeeds(signal);

    const iconIds = [
      ...new Set(
        feeds
          .filter((feed) => feed.icon !== null)
          .map((feed) => feed.icon!.icon_id),
      ),
    ];

    if (iconIds.length === 0) return [];

    const icons = await Promise.all(
      iconIds.map((id) => api.getIcon(id, signal)),
    );

    return icons;
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<IconRow, number>(),
  schemaVersion: 1,
});

export const iconsCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
});
