import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schemas for TanStack DB collections.
//
// These mirror the TypeScript types in `api/types.ts` but are used at runtime
// to validate client-side mutations (insert / update). Data flowing *from* the
// Miniflux API via the sync adapter bypasses schema validation.
// ---------------------------------------------------------------------------

// ---- Shared enums ---------------------------------------------------------

export const entryStatusSchema = z.enum(['read', 'unread', 'removed']);

// ---- Nested helpers -------------------------------------------------------

export const feedIconSchema = z.object({
  feed_id: z.number(),
  icon_id: z.number(),
});

export const categorySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  hide_globally: z.boolean(),
  feed_count: z.number().optional(),
  total_unread: z.number().optional(),
});

export const enclosureSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  entry_id: z.number(),
  url: z.string(),
  mime_type: z.string(),
  size: z.number(),
  media_progression: z.number(),
});

// ---- Top-level collection schemas -----------------------------------------

/**
 * Feed schema -- matches the shape returned by `GET /v1/feeds`.
 *
 * The nested `category` and `icon` fields are stored as-is so we can
 * display feed metadata without extra lookups.
 */
export const feedSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  site_url: z.string(),
  feed_url: z.string(),
  checked_at: z.string(),
  etag_header: z.string(),
  last_modified_header: z.string(),
  parsing_error_message: z.string(),
  parsing_error_count: z.number(),
  scraper_rules: z.string(),
  rewrite_rules: z.string(),
  crawler: z.boolean(),
  blocklist_rules: z.string(),
  keeplist_rules: z.string(),
  user_agent: z.string(),
  username: z.string(),
  password: z.string(),
  disabled: z.boolean(),
  ignore_http_cache: z.boolean(),
  fetch_via_proxy: z.boolean(),
  category: categorySchema,
  icon: feedIconSchema.nullable(),
});

/**
 * Entry schema -- matches the shape returned by `GET /v1/entries`.
 *
 * The nested `feed` and `enclosures` fields are stored inline so the
 * entry list UI can display feed titles / icons without joins.
 */
export const entrySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  feed_id: z.number(),
  title: z.string(),
  url: z.string(),
  comments_url: z.string(),
  author: z.string(),
  content: z.string(),
  hash: z.string(),
  published_at: z.string(),
  created_at: z.string(),
  changed_at: z.string().optional(),
  status: entryStatusSchema,
  share_code: z.string(),
  starred: z.boolean(),
  reading_time: z.number(),
  enclosures: z.array(enclosureSchema).nullable(),
  feed: feedSchema,
  tags: z.array(z.string()).optional(),
});

// ---- Inferred types -------------------------------------------------------

export type CategoryRow = z.infer<typeof categorySchema>;
export type FeedRow = z.infer<typeof feedSchema>;
export type EntryRow = z.infer<typeof entrySchema>;
