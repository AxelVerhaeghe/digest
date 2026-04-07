import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer().primaryKey(),
  user_id: integer().notNull(),
  title: text().notNull(),
  hide_globally: integer({ mode: "boolean" }).notNull().default(false),
  feed_count: integer(),
  total_unread: integer(),
});

export const icons = sqliteTable("icons", {
  id: integer().primaryKey(),
  data: text().notNull(),
  mime_type: text().notNull(),
});

export const feeds = sqliteTable(
  "feeds",
  {
    id: integer().primaryKey(),
    user_id: integer().notNull(),
    title: text().notNull(),
    site_url: text().notNull().default(""),
    feed_url: text().notNull(),
    checked_at: text().notNull().default(""),
    etag_header: text().notNull().default(""),
    last_modified_header: text().notNull().default(""),
    parsing_error_message: text().notNull().default(""),
    parsing_error_count: integer().notNull().default(0),
    scraper_rules: text().notNull().default(""),
    rewrite_rules: text().notNull().default(""),
    crawler: integer({ mode: "boolean" }).notNull().default(false),
    blocklist_rules: text().notNull().default(""),
    keeplist_rules: text().notNull().default(""),
    user_agent: text().notNull().default(""),
    username: text().notNull().default(""),
    password: text().notNull().default(""),
    disabled: integer({ mode: "boolean" }).notNull().default(false),
    ignore_http_cache: integer({ mode: "boolean" }).notNull().default(false),
    fetch_via_proxy: integer({ mode: "boolean" }).notNull().default(false),
    category_id: integer()
      .notNull()
      .references(() => categories.id),
    icon_id: integer().references(() => icons.id),
  },
  (table) => [index("feeds_category_id_idx").on(table.category_id)],
);

export const entries = sqliteTable(
  "entries",
  {
    id: integer().primaryKey(),
    user_id: integer().notNull(),
    feed_id: integer()
      .notNull()
      .references(() => feeds.id),
    title: text().notNull(),
    url: text().notNull().default(""),
    comments_url: text().notNull().default(""),
    author: text().notNull().default(""),
    hash: text().notNull().default(""),
    published_at: text().notNull(),
    created_at: text().notNull(),
    changed_at: text(),
    status: text().notNull().default("unread"),
    share_code: text().notNull().default(""),
    starred: integer({ mode: "boolean" }).notNull().default(false),
    reading_time: integer().notNull().default(0),
    enclosures: text({ mode: "json" }).$type<Enclosure[] | null>(),
    tags: text({ mode: "json" }).$type<string[] | null>(),
    cover_image_url: text(),
  },
  (table) => [
    index("entries_feed_id_idx").on(table.feed_id),
    index("entries_status_published_idx").on(table.status, table.published_at),
    index("entries_published_at_idx").on(table.published_at),
    index("entries_starred_idx").on(table.starred),
  ],
);

export const entryContent = sqliteTable("entry_content", {
  entry_id: integer()
    .primaryKey()
    .references(() => entries.id),
  content: text().notNull(),
});

export const pendingMutations = sqliteTable(
  "pending_mutations",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    type: text().notNull(),
    entry_id: integer().notNull(),
    payload: text({ mode: "json" }).notNull().$type<Record<string, unknown>>(),
    created_at: text().notNull(),
  },
  (table) => [index("pending_mutations_created_at_idx").on(table.created_at)],
);

export const syncMeta = sqliteTable("sync_meta", {
  key: text().primaryKey(),
  value: text().notNull(),
});

export type Enclosure = {
  id: number;
  user_id: number;
  entry_id: number;
  url: string;
  mime_type: string;
  size: number;
  media_progression: number;
};

export type EntryRow = typeof entries.$inferSelect;
export type FeedRow = typeof feeds.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type IconRow = typeof icons.$inferSelect;
export type PendingMutationRow = typeof pendingMutations.$inferSelect;
