import { useLiveInfiniteQuery, useLiveQuery } from "@tanstack/react-db";
import { eq } from "@tanstack/db";

import { entriesCollection } from "@/collections/entries";
import { entryDetailCollection } from "@/collections/entry-details";

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
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry }) => ({
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
        .where(({ entry }) => eq(entry.feed_id, feedId))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry }) => ({
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
        .where(({ entry }) => eq(entry.feed.category.id, categoryId))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry }) => ({
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
        .where(({ entry }) => eq(entry.status, "unread"))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry }) => ({
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
        .where(({ entry }) => eq(entry.starred, true))
        .orderBy(({ entry }) => entry.published_at, "desc")
        .select(({ entry }) => ({
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
            .where(({ entry }) => eq(entry.id, entryId))
            .select(({ entry }) => ({
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
              tags: entry.tags,
            }))
        : undefined,
    [entryId],
  );
}
