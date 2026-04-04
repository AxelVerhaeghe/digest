// ---------------------------------------------------------------------------
// Miniflux API types
// Derived from https://miniflux.app/docs/api.html
// ---------------------------------------------------------------------------

// ---- Enums / unions -------------------------------------------------------

export type EntryStatus = 'read' | 'unread' | 'removed';

export type EntryOrder =
  | 'id'
  | 'status'
  | 'published_at'
  | 'category_title'
  | 'category_id';

export type SortDirection = 'asc' | 'desc';

// ---- Core models ----------------------------------------------------------

export type Category = {
  id: number;
  user_id: number;
  title: string;
  hide_globally: boolean;
  /** Present when `?counts=true` is passed to GET /v1/categories. */
  feed_count?: number;
  /** Present when `?counts=true` is passed to GET /v1/categories. */
  total_unread?: number;
};

export type FeedIcon = {
  feed_id: number;
  icon_id: number;
};

export type Icon = {
  id: number;
  /** Base-64 encoded image data prefixed with mime type. */
  data: string;
  mime_type: string;
};

export type Feed = {
  id: number;
  user_id: number;
  title: string;
  site_url: string;
  feed_url: string;
  checked_at: string;
  etag_header: string;
  last_modified_header: string;
  parsing_error_message: string;
  parsing_error_count: number;
  scraper_rules: string;
  rewrite_rules: string;
  crawler: boolean;
  blocklist_rules: string;
  keeplist_rules: string;
  user_agent: string;
  username: string;
  password: string;
  disabled: boolean;
  ignore_http_cache: boolean;
  fetch_via_proxy: boolean;
  category: Category;
  /** `null` when the feed has no favicon. */
  icon: FeedIcon | null;
};

export type Enclosure = {
  id: number;
  user_id: number;
  entry_id: number;
  url: string;
  mime_type: string;
  size: number;
  media_progression: number;
};

export type Entry = {
  id: number;
  user_id: number;
  feed_id: number;
  title: string;
  url: string;
  comments_url: string;
  author: string;
  content: string;
  hash: string;
  published_at: string;
  created_at: string;
  changed_at?: string;
  status: EntryStatus;
  share_code: string;
  starred: boolean;
  reading_time: number;
  enclosures: Enclosure[] | null;
  feed: Feed;
  tags?: string[];
};

export type User = {
  id: number;
  username: string;
  is_admin: boolean;
  theme: string;
  language: string;
  timezone: string;
  entry_sorting_direction: SortDirection;
  stylesheet: string;
  google_id: string;
  openid_connect_id: string;
  entries_per_page: number;
  keyboard_shortcuts: boolean;
  show_reading_time: boolean;
  entry_swipe: boolean;
  last_login_at: string | null;
};

// ---- Response wrappers ----------------------------------------------------

export type EntryListResponse = {
  total: number;
  entries: Entry[];
};

export type CreateFeedResponse = {
  feed_id: number;
};

export type FeedCounters = {
  reads: Record<string, number>;
  unreads: Record<string, number>;
};

export type FetchContentResponse = {
  content: string;
};

// ---- Request param types --------------------------------------------------

export type EntryQueryParams = {
  status?: EntryStatus | EntryStatus[];
  offset?: number;
  limit?: number;
  order?: EntryOrder;
  direction?: SortDirection;
  before?: number;
  after?: number;
  published_before?: number;
  published_after?: number;
  changed_before?: number;
  changed_after?: number;
  before_entry_id?: number;
  after_entry_id?: number;
  starred?: boolean;
  search?: string;
  category_id?: number;
  globally_visible?: boolean;
};

export type CreateFeedRequest = {
  feed_url: string;
  category_id?: number;
  username?: string;
  password?: string;
  crawler?: boolean;
  user_agent?: string;
  scraper_rules?: string;
  rewrite_rules?: string;
  blocklist_rules?: string;
  keeplist_rules?: string;
  disabled?: boolean;
  ignore_http_cache?: boolean;
  fetch_via_proxy?: boolean;
};

export type UpdateFeedRequest = {
  feed_url?: string;
  site_url?: string;
  title?: string;
  category_id?: number;
  scraper_rules?: string;
  rewrite_rules?: string;
  blocklist_rules?: string;
  keeplist_rules?: string;
  crawler?: boolean;
  user_agent?: string;
  username?: string;
  password?: string;
  disabled?: boolean;
  ignore_http_cache?: boolean;
  fetch_via_proxy?: boolean;
};

export type CreateCategoryRequest = {
  title: string;
  hide_globally?: boolean;
};

export type UpdateCategoryRequest = {
  title?: string;
  hide_globally?: boolean;
};

export type UpdateEntriesRequest = {
  entry_ids: number[];
  status: EntryStatus;
};
