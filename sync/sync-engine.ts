import { eq } from "drizzle-orm";

import { api } from "@/api";
import type {
  Enclosure,
  Entry,
  EntryQueryParams,
  Feed,
  Category,
  Icon,
} from "@/api/types";
import { db } from "@/db/database";
import {
  invalidateAll,
  invalidateCategories,
  invalidateFeeds,
} from "@/db/invalidate";
import {
  categories,
  entries,
  entryContent,
  feeds,
  icons,
  syncMeta,
} from "@/db/schema";
import { getCoverImage } from "@/lib/cover-image";
import { flushMutationQueue } from "@/sync/mutation-processor";

/** Batch size for paginated API requests. */
const PAGE_SIZE = 100;

/**
 * Read a value from the sync_meta table.
 */
async function getMeta(key: string): Promise<string | null> {
  const row = await db
    .select()
    .from(syncMeta)
    .where(eq(syncMeta.key, key))
    .limit(1);
  return row[0]?.value ?? null;
}

/**
 * Write a value to the sync_meta table (upsert).
 */
async function setMeta(key: string, value: string): Promise<void> {
  await db
    .insert(syncMeta)
    .values({ key, value })
    .onConflictDoUpdate({ target: syncMeta.key, set: { value } });
}

/**
 * Upsert categories from the Miniflux API into the local database.
 */
async function syncCategories(signal?: AbortSignal): Promise<void> {
  const apiCategories: Category[] = await api.getCategories(true, signal);

  for (const cat of apiCategories) {
    await db
      .insert(categories)
      .values({
        id: cat.id,
        user_id: cat.user_id,
        title: cat.title,
        hide_globally: cat.hide_globally,
        feed_count: cat.feed_count,
        total_unread: cat.total_unread,
      })
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          title: cat.title,
          hide_globally: cat.hide_globally,
          feed_count: cat.feed_count,
          total_unread: cat.total_unread,
        },
      });
  }

  invalidateCategories();
}

/**
 * Upsert feeds and their icons from the Miniflux API.
 */
async function syncFeeds(signal?: AbortSignal): Promise<void> {
  const apiFeeds: Feed[] = await api.getFeeds(signal);

  const iconIds = new Set<number>();
  for (const feed of apiFeeds) {
    if (feed.icon !== null) {
      iconIds.add(feed.icon.icon_id);
    }
  }

  if (iconIds.size > 0) {
    const iconResults: Icon[] = await Promise.all(
      [...iconIds].map((id) => api.getIcon(id, signal)),
    );

    for (const icon of iconResults) {
      await db
        .insert(icons)
        .values({
          id: icon.id,
          data: icon.data,
          mime_type: icon.mime_type,
        })
        .onConflictDoUpdate({
          target: icons.id,
          set: {
            data: icon.data,
            mime_type: icon.mime_type,
          },
        });
    }
  }

  for (const feed of apiFeeds) {
    await db
      .insert(feeds)
      .values({
        id: feed.id,
        user_id: feed.user_id,
        title: feed.title,
        site_url: feed.site_url,
        feed_url: feed.feed_url,
        checked_at: feed.checked_at,
        etag_header: feed.etag_header,
        last_modified_header: feed.last_modified_header,
        parsing_error_message: feed.parsing_error_message,
        parsing_error_count: feed.parsing_error_count,
        scraper_rules: feed.scraper_rules,
        rewrite_rules: feed.rewrite_rules,
        crawler: feed.crawler,
        blocklist_rules: feed.blocklist_rules,
        keeplist_rules: feed.keeplist_rules,
        user_agent: feed.user_agent,
        username: feed.username,
        password: feed.password,
        disabled: feed.disabled,
        ignore_http_cache: feed.ignore_http_cache,
        fetch_via_proxy: feed.fetch_via_proxy,
        category_id: feed.category.id,
        icon_id: feed.icon?.icon_id ?? null,
      })
      .onConflictDoUpdate({
        target: feeds.id,
        set: {
          title: feed.title,
          site_url: feed.site_url,
          feed_url: feed.feed_url,
          checked_at: feed.checked_at,
          etag_header: feed.etag_header,
          last_modified_header: feed.last_modified_header,
          parsing_error_message: feed.parsing_error_message,
          parsing_error_count: feed.parsing_error_count,
          scraper_rules: feed.scraper_rules,
          rewrite_rules: feed.rewrite_rules,
          crawler: feed.crawler,
          blocklist_rules: feed.blocklist_rules,
          keeplist_rules: feed.keeplist_rules,
          user_agent: feed.user_agent,
          username: feed.username,
          password: feed.password,
          disabled: feed.disabled,
          ignore_http_cache: feed.ignore_http_cache,
          fetch_via_proxy: feed.fetch_via_proxy,
          category_id: feed.category.id,
          icon_id: feed.icon?.icon_id ?? null,
        },
      });
  }

  invalidateFeeds();
}

/**
 * Convert a Miniflux Entry to an entry row and upsert it.
 * Stores content separately in entry_content.
 */
async function upsertEntry(entry: Entry): Promise<void> {
  const coverImage = getCoverImage(entry.enclosures, entry.content);

  await db
    .insert(entries)
    .values({
      id: entry.id,
      user_id: entry.user_id,
      feed_id: entry.feed_id,
      title: entry.title,
      url: entry.url,
      comments_url: entry.comments_url,
      author: entry.author,
      hash: entry.hash,
      published_at: entry.published_at,
      created_at: entry.created_at,
      changed_at: entry.changed_at ?? null,
      status: entry.status,
      share_code: entry.share_code,
      starred: entry.starred,
      reading_time: entry.reading_time,
      enclosures: entry.enclosures,
      tags: entry.tags ?? null,
      cover_image_url: coverImage,
    })
    .onConflictDoUpdate({
      target: entries.id,
      set: {
        title: entry.title,
        url: entry.url,
        comments_url: entry.comments_url,
        author: entry.author,
        hash: entry.hash,
        published_at: entry.published_at,
        changed_at: entry.changed_at ?? null,
        status: entry.status,
        share_code: entry.share_code,
        starred: entry.starred,
        reading_time: entry.reading_time,
        enclosures: entry.enclosures,
        tags: entry.tags ?? null,
        cover_image_url: coverImage,
      },
    });

  if (entry.content) {
    await db
      .insert(entryContent)
      .values({
        entry_id: entry.id,
        content: entry.content,
      })
      .onConflictDoUpdate({
        target: entryContent.entry_id,
        set: { content: entry.content },
      });
  }
}

/**
 * Full initial sync. Fetches categories, feeds, icons, and all entries
 * from the Miniflux instance (paginated in batches of PAGE_SIZE).
 */
export async function initialSync(signal?: AbortSignal): Promise<void> {
  await syncCategories(signal);
  await syncFeeds(signal);

  let offset = 0;
  let oldestPublishedAt: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const res = await api.getEntries(
      {
        order: "published_at",
        direction: "desc",
        limit: PAGE_SIZE,
        offset,
        status: ["unread", "read"],
      },
      signal,
    );

    for (const entry of res.entries) {
      await upsertEntry(entry);
      if (
        oldestPublishedAt === null ||
        entry.published_at < oldestPublishedAt
      ) {
        oldestPublishedAt = entry.published_at;
      }
    }

    offset += res.entries.length;
    hasMore = res.entries.length === PAGE_SIZE;
  }

  await setMeta("last_sync_at", new Date().toISOString());
  if (oldestPublishedAt) {
    await setMeta("oldest_synced_at", oldestPublishedAt);
  }
  invalidateAll();
}

/**
 * Incremental sync. Fetches only entries changed since the last sync
 * timestamp. Also refreshes feeds/categories.
 */
export async function incrementalSync(signal?: AbortSignal): Promise<void> {
  await flushMutationQueue();

  const lastSyncAt = await getMeta("last_sync_at");

  await syncCategories(signal);
  await syncFeeds(signal);

  if (lastSyncAt) {
    const changedAfter = Math.floor(new Date(lastSyncAt).getTime() / 1000);
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const res = await api.getEntries(
        {
          order: "published_at",
          direction: "desc",
          limit: PAGE_SIZE,
          offset,
          changed_after: changedAfter,
          status: ["unread", "read"],
        },
        signal,
      );

      for (const entry of res.entries) {
        await upsertEntry(entry);
      }

      offset += res.entries.length;
      hasMore = res.entries.length === PAGE_SIZE;
    }
  }

  await setMeta("last_sync_at", new Date().toISOString());
  invalidateAll();
}

/**
 * Check whether this is the first sync (no data yet).
 */
export async function needsInitialSync(): Promise<boolean> {
  const lastSync = await getMeta("last_sync_at");
  return lastSync === null;
}

/**
 * Fetch and cache the content for a single entry if not already stored.
 * Returns the HTML content string.
 */
export async function fetchEntryContent(entryId: number): Promise<string> {
  const existing = await db
    .select({ content: entryContent.content })
    .from(entryContent)
    .where(eq(entryContent.entry_id, entryId))
    .limit(1);

  if (existing[0]) {
    return existing[0].content;
  }

  const entry = await api.getEntry(entryId);

  await db
    .insert(entryContent)
    .values({ entry_id: entry.id, content: entry.content })
    .onConflictDoUpdate({
      target: entryContent.entry_id,
      set: { content: entry.content },
    });

  return entry.content;
}

/**
 * Filter parameters for on-demand fetching of older entries.
 */
export type FetchOlderFilters = {
  feedId?: number;
  categoryId?: number;
  status?: "read" | "unread";
  starred?: boolean;
};

/**
 * Fetch a batch of entries from the Miniflux API that are older than
 * `beforeTimestamp` and store them locally. Used by infinite-scroll
 * hooks when local data runs out.
 *
 * Returns the number of entries fetched and whether the server likely
 * has more data beyond this batch.
 */
export async function fetchOlderEntries(
  beforeTimestamp: string,
  filters?: FetchOlderFilters,
  limit: number = PAGE_SIZE,
): Promise<{ fetched: number; hasMore: boolean }> {
  const publishedBefore = Math.floor(
    new Date(beforeTimestamp).getTime() / 1000,
  );

  const params: EntryQueryParams = {
    order: "published_at",
    direction: "desc",
    limit,
    published_before: publishedBefore,
    status: filters?.status ? [filters.status] : ["unread", "read"],
  };

  if (filters?.feedId != null) {
    // Use the feed-scoped endpoint for better performance
    const res = await api.getFeedEntries(filters.feedId, params);

    for (const entry of res.entries) {
      await upsertEntry(entry);
    }

    if (res.entries.length > 0) {
      await updateOldestSyncedAt(res.entries);
    }

    return {
      fetched: res.entries.length,
      hasMore: res.entries.length === limit,
    };
  }

  if (filters?.categoryId != null) {
    params.category_id = filters.categoryId;
  }

  if (filters?.starred != null) {
    params.starred = filters.starred;
  }

  const res = await api.getEntries(params);

  for (const entry of res.entries) {
    await upsertEntry(entry);
  }

  if (res.entries.length > 0) {
    await updateOldestSyncedAt(res.entries);
  }

  return { fetched: res.entries.length, hasMore: res.entries.length === limit };
}

/**
 * Update the oldest_synced_at timestamp if any of the fetched entries
 * are older than the current value.
 */
async function updateOldestSyncedAt(fetchedEntries: Entry[]): Promise<void> {
  let oldest = await getMeta("oldest_synced_at");

  for (const entry of fetchedEntries) {
    if (oldest === null || entry.published_at < oldest) {
      oldest = entry.published_at;
    }
  }

  if (oldest !== null) {
    await setMeta("oldest_synced_at", oldest);
  }
}
