import { useEffect } from "react";

import { eq } from "@tanstack/db";
import { useLiveInfiniteQuery, useLiveQuery } from "@tanstack/react-db";

import { entriesCollection } from "@/collections/entries";
import { entryDetailCollection } from "@/collections/entry-details";
import { iconsCollection } from "@/collections/icons";

/** Number of entries loaded per page in infinite-scroll lists. */
const PAGE_SIZE = 20;

/**
 * All entries from the local store, ordered newest-first.
 *
 * Returns paginated data with infinite-scroll controls.
 */
export function useEntries() {
  return useLiveInfiniteQuery(
    (q) =>
      q
        .from({ entry: entriesCollection })
        .leftJoin({ icon: iconsCollection }, ({ entry, icon }) =>
          eq(entry.feed.icon!.icon_id, icon.id),
        )
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry, icon }) => ({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          author: entry.author,
          published_at: entry.published_at,
          status: entry.status,
          starred: entry.starred,
          reading_time: entry.reading_time,
          feed_id: entry.feed_id,
          feed: entry.feed,
          cover_image_url: entry.cover_image_url,
          category: entry.feed.category.title,
          icon: {
            data: icon.data,
            mime_type: icon.mime_type,
          },
        })),
    { pageSize: PAGE_SIZE },
  );
}

/**
 * Entries belonging to a single feed, ordered newest-first.
 *
 * @param feedId - The Miniflux feed ID to filter by.
 */
export function useFeedEntries(feedId: number) {
  return useLiveInfiniteQuery(
    (q) =>
      q
        .from({ entry: entriesCollection })
        .leftJoin({ icon: iconsCollection }, ({ entry, icon }) =>
          eq(entry.feed.icon!.icon_id, icon.id),
        )
        .where(({ entry }) => eq(entry.feed_id, feedId))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry, icon }) => ({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          author: entry.author,
          published_at: entry.published_at,
          status: entry.status,
          starred: entry.starred,
          reading_time: entry.reading_time,
          feed_id: entry.feed_id,
          feed: entry.feed,
          cover_image_url: entry.cover_image_url,
          category: entry.feed.category.title,
          icon: {
            data: icon.data,
            mime_type: icon.mime_type,
          },
        })),
    { pageSize: PAGE_SIZE },
    [feedId],
  );
}

/**
 * Entries whose feed belongs to the given category, ordered newest-first.
 *
 * Filters on the nested `feed.category.id` field.
 *
 * @param categoryId - The Miniflux category ID to filter by.
 */
export function useCategoryEntries(categoryId: number) {
  return useLiveInfiniteQuery(
    (q) =>
      q
        .from({ entry: entriesCollection })
        .leftJoin({ icon: iconsCollection }, ({ entry, icon }) =>
          eq(entry.feed.icon!.icon_id, icon.id),
        )
        .where(({ entry }) => eq(entry.feed.category.id, categoryId))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry, icon }) => ({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          author: entry.author,
          published_at: entry.published_at,
          status: entry.status,
          starred: entry.starred,
          reading_time: entry.reading_time,
          feed_id: entry.feed_id,
          feed: entry.feed,
          cover_image_url: entry.cover_image_url,
          icon: {
            data: icon.data,
            mime_type: icon.mime_type,
          },
        })),
    { pageSize: PAGE_SIZE },
    [categoryId],
  );
}

/**
 * All unread entries, ordered newest-first.
 */
export function useUnreadEntries() {
  return useLiveInfiniteQuery(
    (q) =>
      q
        .from({ entry: entriesCollection })
        .leftJoin({ icon: iconsCollection }, ({ entry, icon }) =>
          eq(entry.feed.icon!.icon_id, icon.id),
        )
        .where(({ entry }) => eq(entry.status, "unread"))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry, icon }) => ({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          author: entry.author,
          published_at: entry.published_at,
          status: entry.status,
          starred: entry.starred,
          reading_time: entry.reading_time,
          feed_id: entry.feed_id,
          feed: entry.feed,
          cover_image_url: entry.cover_image_url,
          icon: {
            data: icon.data,
            mime_type: icon.mime_type,
          },
        })),
    { pageSize: PAGE_SIZE },
  );
}

/**
 * All bookmarked / starred entries, ordered newest-first.
 */
export function useStarredEntries() {
  return useLiveInfiniteQuery(
    (q) =>
      q
        .from({ entry: entriesCollection })
        .leftJoin({ icon: iconsCollection }, ({ entry, icon }) =>
          eq(entry.feed.icon!.icon_id, icon.id),
        )
        .where(({ entry }) => eq(entry.starred, true))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry, icon }) => ({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          author: entry.author,
          published_at: entry.published_at,
          status: entry.status,
          starred: entry.starred,
          reading_time: entry.reading_time,
          feed_id: entry.feed_id,
          feed: entry.feed,
          cover_image_url: entry.cover_image_url,
          icon: {
            data: icon.data,
            mime_type: icon.mime_type,
          },
        })),
    { pageSize: PAGE_SIZE },
  );
}

/**
 * Look up a single entry by its Miniflux ID.
 *
 * Returns the full entry row including `content` (which the list hooks
 * intentionally omit to keep list renders lightweight). Fetches from the
 * separate `entryDetailCollection` so the large HTML body is only loaded
 * when actually viewing an entry.
 *
 * @param entryId - The Miniflux entry ID, or `null`/`undefined` to disable
 *   the query (useful when the ID isn't available yet).
 */
export function useEntry(entryId: number | null | undefined) {
  return useLiveQuery(
    (q) =>
      entryId != null
        ? q
            .from({ entry: entryDetailCollection })
            .leftJoin({ icon: iconsCollection }, ({ entry, icon }) =>
              eq(entry.feed.icon!.icon_id, icon.id),
            )
            .where(({ entry }) => eq(entry.id, entryId))
            .findOne()
            .select(({ entry, icon }) => ({
              id: entry.id,
              title: entry.title,
              url: entry.url,
              comments_url: entry.comments_url,
              author: entry.author,
              content: entry.content,
              published_at: entry.published_at,
              status: entry.status,
              starred: entry.starred,
              reading_time: entry.reading_time,
              feed_id: entry.feed_id,
              feed: entry.feed,
              enclosures: entry.enclosures,
              cover_image_url: entry.cover_image_url,
              tags: entry.tags,
              category: entry.feed.category.title,
              icon: {
                data: icon.data,
                mime_type: icon.mime_type,
              },
            }))
        : undefined,
    [entryId],
  );
}

/**
 * Mark an entry as read when the article detail screen mounts.
 *
 * Performs an optimistic update on both the list and detail collections so
 * the feed list immediately reflects the change (dimmed card). The
 * collections' `onUpdate` handlers push the status change to the Miniflux
 * API in the background.
 *
 * No-ops if the entry is already read or if `status` is not yet available.
 *
 * @param entryId - The Miniflux entry ID.
 * @param status  - The entry's current status from the live query.
 */
export function useMarkAsRead(entryId: number, status: string | undefined) {
  useEffect(() => {
    if (status !== "unread") return;

    entriesCollection.update(entryId, (draft) => {
      draft.status = "read";
    });
    entryDetailCollection.update(entryId, (draft) => {
      draft.status = "read";
    });
  }, [entryId, status]);
}
