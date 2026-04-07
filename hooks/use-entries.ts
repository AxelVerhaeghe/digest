import { useEffect, useRef } from "react";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { and, desc, eq, inArray, lt, SQL } from "drizzle-orm";

import { db } from "@/db/database";
import {
  categories,
  entries,
  feeds,
  icons,
  pendingMutations,
} from "@/db/schema";
import { invalidateEntries } from "@/db/invalidate";
import { fetchEntryContent, fetchOlderEntries } from "@/sync/sync-engine";
import type { FetchOlderFilters } from "@/sync/sync-engine";
import { flushMutationQueue } from "@/sync/mutation-processor";
import type { EntryStatus } from "@/api/types";

/** Number of entries loaded per page in infinite-scroll lists. */
const PAGE_SIZE = 20;

/**
 * Shared select fields for entry list queries. Avoids duplicating the
 * projection across every list hook.
 */
const entryListSelect = {
  id: entries.id,
  title: entries.title,
  url: entries.url,
  author: entries.author,
  published_at: entries.published_at,
  status: entries.status,
  starred: entries.starred,
  reading_time: entries.reading_time,
  feed_id: entries.feed_id,
  cover_image_url: entries.cover_image_url,
  feed_title: feeds.title,
  feed_site_url: feeds.site_url,
  category_id: feeds.category_id,
  category_title: categories.title,
  icon_data: icons.data,
  icon_mime_type: icons.mime_type,
} as const;

export type EntryListItem = {
  id: number;
  title: string;
  url: string;
  author: string;
  published_at: string;
  status: EntryStatus;
  starred: boolean;
  reading_time: number;
  feed_id: number;
  cover_image_url: string | null;
  feed: {
    title: string;
    site_url: string;
    category: {
      id: number;
      title: string;
    };
  };
  icon: {
    data: string | null;
    mime_type: string | null;
  };
};

/**
 * Transform a raw query row into the shape expected by UI components.
 */
function toEntryListItem(row: {
  id: number;
  title: string;
  url: string;
  author: string;
  published_at: string;
  status: EntryStatus;
  starred: boolean;
  reading_time: number;
  feed_id: number;
  cover_image_url: string | null;
  feed_title: string;
  feed_site_url: string;
  category_id: number;
  category_title: string;
  icon_data: string | null;
  icon_mime_type: string | null;
}): EntryListItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    author: row.author,
    published_at: row.published_at,
    status: row.status,
    starred: row.starred,
    reading_time: row.reading_time,
    feed_id: row.feed_id,
    cover_image_url: row.cover_image_url,
    feed: {
      title: row.feed_title,
      site_url: row.feed_site_url,
      category: {
        id: row.category_id,
        title: row.category_title,
      },
    },
    icon: {
      data: row.icon_data,
      mime_type: row.icon_mime_type,
    },
  };
}

/**
 * Base query builder for entry lists. Joins entries with feeds, categories,
 * and icons.
 */
function baseEntryListQuery() {
  return db
    .select(entryListSelect)
    .from(entries)
    .innerJoin(feeds, eq(entries.feed_id, feeds.id))
    .innerJoin(categories, eq(feeds.category_id, categories.id))
    .leftJoin(icons, eq(feeds.icon_id, icons.id));
}

type EntryListRow = Awaited<ReturnType<typeof baseEntryListQuery>>[number];

/**
 * Page cursor for hybrid local/remote infinite queries.
 *
 * - `offset`: the SQL OFFSET for the next local page.
 * - `remoteExhausted`: true when the API has no more older entries.
 * - `oldestTimestamp`: the published_at of the oldest entry seen so far,
 *   used as the cursor for fetching older entries from the API.
 */
type PageCursor = {
  offset: number;
  remoteExhausted: boolean;
  oldestTimestamp: string | null;
};

const INITIAL_CURSOR: PageCursor = {
  offset: 0,
  remoteExhausted: false,
  oldestTimestamp: null,
};

/**
 * Hybrid local-then-remote query function. Reads from local SQLite first;
 * when local data runs out, fetches older entries from the Miniflux API,
 * stores them locally, and returns them.
 */
async function hybridQueryFn(
  cursor: PageCursor,
  whereClause: SQL | undefined,
  filters: FetchOlderFilters,
): Promise<{ items: EntryListItem[]; nextCursor: PageCursor }> {
  const conditions = whereClause ? [whereClause] : [];

  const localRows = await baseEntryListQuery()
    .where(and(...conditions))
    .orderBy(desc(entries.published_at))
    .limit(PAGE_SIZE)
    .offset(cursor.offset);

  const localItems = localRows.map(toEntryListItem);

  // Track the oldest timestamp across all items we've seen
  let oldest = cursor.oldestTimestamp;
  for (const item of localItems) {
    if (oldest === null || item.published_at < oldest) {
      oldest = item.published_at;
    }
  }

  // If we got a full page from local, return it
  if (localItems.length === PAGE_SIZE) {
    return {
      items: localItems,
      nextCursor: {
        offset: cursor.offset + PAGE_SIZE,
        remoteExhausted: cursor.remoteExhausted,
        oldestTimestamp: oldest,
      },
    };
  }

  // Local data ran out. If remote is already exhausted, return what we have.
  if (cursor.remoteExhausted || oldest === null) {
    return {
      items: localItems,
      nextCursor: { ...cursor, remoteExhausted: true, oldestTimestamp: oldest },
    };
  }

  // Try fetching older entries from the API
  try {
    const needed = PAGE_SIZE - localItems.length;
    const { fetched, hasMore } = await fetchOlderEntries(
      oldest,
      filters,
      needed,
    );

    if (fetched === 0) {
      return {
        items: localItems,
        nextCursor: {
          offset: cursor.offset + localItems.length,
          remoteExhausted: true,
          oldestTimestamp: oldest,
        },
      };
    }

    // Re-query local to include newly fetched entries
    const refreshedRows = await baseEntryListQuery()
      .where(and(...conditions))
      .orderBy(desc(entries.published_at))
      .limit(PAGE_SIZE)
      .offset(cursor.offset);

    const refreshedItems = refreshedRows.map(toEntryListItem);

    let refreshedOldest = oldest;
    for (const item of refreshedItems) {
      if (item.published_at < refreshedOldest) {
        refreshedOldest = item.published_at;
      }
    }

    return {
      items: refreshedItems,
      nextCursor: {
        offset: cursor.offset + refreshedItems.length,
        remoteExhausted: !hasMore,
        oldestTimestamp: refreshedOldest,
      },
    };
  } catch {
    // Offline or API error — return what we have locally
    return {
      items: localItems,
      nextCursor: {
        offset: cursor.offset + localItems.length,
        remoteExhausted: false, // Don't permanently mark exhausted on network errors
        oldestTimestamp: oldest,
      },
    };
  }
}

/**
 * All entries from the local store, ordered newest-first.
 * Transparently fetches older entries from the API when local data runs out.
 */
export function useEntries() {
  return useInfiniteQuery({
    queryKey: ["entries", "all"],
    queryFn: async ({ pageParam }) => {
      const { items, nextCursor } = await hybridQueryFn(
        pageParam,
        undefined,
        {},
      );
      return { items, nextCursor };
    },
    getNextPageParam: (lastPage) =>
      lastPage.items.length === PAGE_SIZE ? lastPage.nextCursor : undefined,
    initialPageParam: INITIAL_CURSOR,
    select: (data) => ({
      ...data,
      pages: data.pages.map((p) => p.items),
    }),
  });
}

/**
 * Entries belonging to a single feed, ordered newest-first.
 */
export function useFeedEntries(feedId: number) {
  return useInfiniteQuery({
    queryKey: ["entries", "feed", feedId],
    queryFn: async ({ pageParam }) => {
      const { items, nextCursor } = await hybridQueryFn(
        pageParam,
        eq(entries.feed_id, feedId),
        { feedId },
      );
      return { items, nextCursor };
    },
    getNextPageParam: (lastPage) =>
      lastPage.items.length === PAGE_SIZE ? lastPage.nextCursor : undefined,
    initialPageParam: INITIAL_CURSOR,
    select: (data) => ({
      ...data,
      pages: data.pages.map((p) => p.items),
    }),
  });
}

/**
 * Entries whose feed belongs to the given category, ordered newest-first.
 */
export function useCategoryEntries(categoryId: number) {
  return useInfiniteQuery({
    queryKey: ["entries", "category", categoryId],
    queryFn: async ({ pageParam }) => {
      const { items, nextCursor } = await hybridQueryFn(
        pageParam,
        eq(feeds.category_id, categoryId),
        { categoryId },
      );
      return { items, nextCursor };
    },
    getNextPageParam: (lastPage) =>
      lastPage.items.length === PAGE_SIZE ? lastPage.nextCursor : undefined,
    initialPageParam: INITIAL_CURSOR,
    select: (data) => ({
      ...data,
      pages: data.pages.map((p) => p.items),
    }),
  });
}

/**
 * All unread entries, ordered newest-first.
 */
export function useUnreadEntries() {
  return useInfiniteQuery({
    queryKey: ["entries", "unread"],
    queryFn: async ({ pageParam }) => {
      const { items, nextCursor } = await hybridQueryFn(
        pageParam,
        eq(entries.status, "unread"),
        { status: "unread" },
      );
      return { items, nextCursor };
    },
    getNextPageParam: (lastPage) =>
      lastPage.items.length === PAGE_SIZE ? lastPage.nextCursor : undefined,
    initialPageParam: INITIAL_CURSOR,
    select: (data) => ({
      ...data,
      pages: data.pages.map((p) => p.items),
    }),
  });
}

/**
 * All bookmarked / starred entries, ordered newest-first.
 */
export function useStarredEntries() {
  return useInfiniteQuery({
    queryKey: ["entries", "starred"],
    queryFn: async ({ pageParam }) => {
      const { items, nextCursor } = await hybridQueryFn(
        pageParam,
        eq(entries.starred, true),
        { starred: true },
      );
      return { items, nextCursor };
    },
    getNextPageParam: (lastPage) =>
      lastPage.items.length === PAGE_SIZE ? lastPage.nextCursor : undefined,
    initialPageParam: INITIAL_CURSOR,
    select: (data) => ({
      ...data,
      pages: data.pages.map((p) => p.items),
    }),
  });
}

/**
 * Look up a single entry by its Miniflux ID.
 *
 * Fetches entry metadata from local SQLite and lazily loads the HTML
 * content (from local cache or API fallback).
 */
export function useEntry(entryId: number | null | undefined) {
  const entryQuery = useQuery({
    queryKey: ["entries", "detail", entryId],
    queryFn: async () => {
      if (entryId == null) return null;

      const rows = await db
        .select({
          id: entries.id,
          title: entries.title,
          url: entries.url,
          comments_url: entries.comments_url,
          author: entries.author,
          published_at: entries.published_at,
          status: entries.status,
          starred: entries.starred,
          reading_time: entries.reading_time,
          feed_id: entries.feed_id,
          enclosures: entries.enclosures,
          tags: entries.tags,
          cover_image_url: entries.cover_image_url,
          feed_title: feeds.title,
          feed_site_url: feeds.site_url,
          category_id: feeds.category_id,
          category_title: categories.title,
          icon_data: icons.data,
          icon_mime_type: icons.mime_type,
        })
        .from(entries)
        .innerJoin(feeds, eq(entries.feed_id, feeds.id))
        .innerJoin(categories, eq(feeds.category_id, categories.id))
        .leftJoin(icons, eq(feeds.icon_id, icons.id))
        .where(eq(entries.id, entryId))
        .limit(1);

      return rows[0] ?? null;
    },
    enabled: entryId != null,
  });

  const contentQuery = useQuery({
    queryKey: ["content", entryId],
    queryFn: () => {
      if (entryId == null) throw new Error("entryId is required");
      return fetchEntryContent(entryId);
    },
    enabled: entryId != null,
  });

  const entry = entryQuery.data;
  if (!entry) return { data: null };

  return {
    data: {
      id: entry.id,
      title: entry.title,
      url: entry.url,
      comments_url: entry.comments_url,
      author: entry.author,
      published_at: entry.published_at,
      status: entry.status,
      starred: entry.starred,
      reading_time: entry.reading_time,
      feed_id: entry.feed_id,
      enclosures: entry.enclosures,
      tags: entry.tags,
      cover_image_url: entry.cover_image_url,
      content: contentQuery.data ?? null,
      feed: {
        title: entry.feed_title,
        site_url: entry.feed_site_url,
        category: {
          id: entry.category_id,
          title: entry.category_title,
        },
      },
      icon: {
        data: entry.icon_data ?? null,
        mime_type: entry.icon_mime_type ?? null,
      },
      category: entry.category_title,
    },
  };
}

/**
 * Mark an entry as read when the article detail screen mounts.
 *
 * Performs an optimistic local update and queues the change for API sync.
 * Only fires once per entry.
 */
export function useMarkAsRead(
  entryId: number,
  status: EntryStatus | undefined,
) {
  const alreadyMarked = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    alreadyMarked.current = false;
  }, [entryId]);

  useEffect(() => {
    if (alreadyMarked.current) return;
    if (status !== "unread") return;

    alreadyMarked.current = true;

    (async () => {
      await db
        .update(entries)
        .set({ status: "read" })
        .where(eq(entries.id, entryId));

      await db.insert(pendingMutations).values({
        type: "status_change",
        entry_id: entryId,
        payload: { status: "read" },
        created_at: new Date().toISOString(),
      });

      invalidateEntries();
      queryClient.invalidateQueries({
        queryKey: ["entries", "detail", entryId],
      });
      flushMutationQueue().catch(() => {});
    })();
  }, [entryId, status, queryClient]);
}

/**
 * Returns a mutation for toggling an entry's read/unread status.
 */
export function useToggleReadStatus(
  entryId: number,
  currentStatus?: EntryStatus,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const newStatus = currentStatus === "unread" ? "read" : "unread";

      await db
        .update(entries)
        .set({ status: newStatus })
        .where(eq(entries.id, entryId));

      await db.insert(pendingMutations).values({
        type: "status_change",
        entry_id: entryId,
        payload: { status: newStatus },
        created_at: new Date().toISOString(),
      });

      invalidateEntries();
      queryClient.invalidateQueries({
        queryKey: ["entries", "detail", entryId],
      });
      flushMutationQueue().catch(() => {});
    },
  });
}

/**
 * Returns a mutation for toggling an entry's bookmark/starred state.
 */
export function useToggleBookmark(entryId: number, currentStarred?: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const newStarred = !currentStarred;

      await db
        .update(entries)
        .set({ starred: newStarred })
        .where(eq(entries.id, entryId));

      await db.insert(pendingMutations).values({
        type: "toggle_bookmark",
        entry_id: entryId,
        payload: { starred: newStarred },
        created_at: new Date().toISOString(),
      });

      invalidateEntries();
      queryClient.invalidateQueries({
        queryKey: ["entries", "detail", entryId],
      });
      flushMutationQueue().catch(() => {});
    },
  });
}

/**
 * Returns a mutation that marks all unread entries for a given feed as read.
 *
 * Performs a local batch update, queues pending mutations for each affected
 * entry, and flushes the mutation queue.
 */
export function useMarkAllFeedEntriesRead(feedId: number) {
  return useMutation({
    mutationFn: async () => {
      const unreadRows = await db
        .select({ id: entries.id })
        .from(entries)
        .where(and(eq(entries.feed_id, feedId), eq(entries.status, "unread")));

      if (unreadRows.length === 0) return;

      const ids = unreadRows.map((r) => r.id);

      await db
        .update(entries)
        .set({ status: "read" })
        .where(inArray(entries.id, ids));

      const now = new Date().toISOString();
      await db.insert(pendingMutations).values(
        ids.map((id) => ({
          type: "status_change",
          entry_id: id,
          payload: { status: "read" as const },
          created_at: now,
        })),
      );

      invalidateEntries();
      flushMutationQueue().catch(() => {});
    },
  });
}

/**
 * Returns a mutation that marks all unread entries (across all feeds) as read.
 *
 * Performs a local batch update, queues pending mutations for each affected
 * entry, and flushes the mutation queue.
 */
export function useMarkAllEntriesRead() {
  return useMutation({
    mutationFn: async () => {
      const unreadRows = await db
        .select({ id: entries.id })
        .from(entries)
        .where(eq(entries.status, "unread"));

      if (unreadRows.length === 0) return;

      const ids = unreadRows.map((r) => r.id);

      await db
        .update(entries)
        .set({ status: "read" })
        .where(inArray(entries.id, ids));

      const now = new Date().toISOString();
      await db.insert(pendingMutations).values(
        ids.map((id) => ({
          type: "status_change",
          entry_id: id,
          payload: { status: "read" as const },
          created_at: now,
        })),
      );

      invalidateEntries();
      flushMutationQueue().catch(() => {});
    },
  });
}
