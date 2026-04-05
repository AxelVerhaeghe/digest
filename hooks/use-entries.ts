import { useLiveInfiniteQuery, useLiveQuery } from "@tanstack/react-db";
import { eq } from "@tanstack/db";

import { entriesCollection } from "@/collections/entries";
import type { Enclosure } from "@/api/types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Number of entries loaded per page in infinite-scroll lists. */
const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Cover image helper
// ---------------------------------------------------------------------------

const IMAGE_MIME_PREFIX = "image/";

/**
 * Regex to extract the `src` attribute from the first `<img>` tag in an HTML
 * string. Handles both single- and double-quoted attribute values.
 */
const FIRST_IMG_SRC_RE = /<img\s[^>]*?src=["']([^"']+)["']/i;

/**
 * Extract a cover image URL from an entry.
 *
 * Resolution order:
 * 1. First enclosure with an `image/*` MIME type.
 * 2. First `<img src="…">` found in the entry's HTML content.
 *
 * Returns `null` when neither source yields an image.
 */
export function getCoverImage(
  enclosures: Enclosure[] | null | undefined,
  content?: string | null,
): string | null {
  // 1. Prefer an explicit image enclosure.
  if (enclosures) {
    const img = enclosures.find((e) =>
      e.mime_type.startsWith(IMAGE_MIME_PREFIX),
    );
    if (img) return img.url;
  }

  // 2. Fall back to the first <img> in the HTML content.
  if (content) {
    const match = FIRST_IMG_SRC_RE.exec(content);
    if (match?.[1]) return match[1];
  }

  return null;
}

// ---------------------------------------------------------------------------
// Infinite-scroll list hooks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Single entry lookup
// ---------------------------------------------------------------------------

/**
 * Look up a single entry by its Miniflux ID.
 *
 * Returns the full entry row including `content` (which the list hooks
 * intentionally omit to keep list renders lightweight).
 *
 * @param entryId - The Miniflux entry ID, or `null`/`undefined` to disable
 *   the query (useful when the ID isn't available yet).
 */
export function useEntry(entryId: number | null | undefined) {
  return useLiveQuery(
    (q) =>
      entryId != null
        ? q
            .from({ entry: entriesCollection })
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
