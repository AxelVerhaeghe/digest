import type { RequestConfig } from "@/api/request";
import { request } from "@/api/request";
import type {
  Category,
  CreateCategoryRequest,
  CreateFeedRequest,
  CreateFeedResponse,
  Entry,
  EntryListResponse,
  EntryQueryParams,
  Feed,
  FeedCounters,
  FetchContentResponse,
  Icon,
  UpdateCategoryRequest,
  UpdateEntriesRequest,
  UpdateFeedRequest,
  User,
} from "@/api/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert {@link EntryQueryParams} to the flat query record expected by
 * {@link request}. The `status` field is special-cased because Miniflux
 * accepts it as a repeated query parameter for multi-value filtering.
 */
function entryQuery(
  params?: EntryQueryParams,
):
  | Record<string, string | number | boolean | string[] | undefined>
  | undefined {
  if (!params) return undefined;

  const { status, ...rest } = params;

  const query: Record<
    string,
    string | number | boolean | string[] | undefined
  > = {
    ...rest,
  };

  if (status !== undefined) {
    query.status = Array.isArray(status) ? status : [status];
  }

  return query;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Typed Miniflux API client.
 *
 * ```ts
 * const api = new MinifluxClient({ baseUrl: 'https://rss.example.com', token: '…' });
 * const feeds = await api.getFeeds();
 * ```
 *
 * Every method accepts an optional `AbortSignal` as its last argument so
 * callers can cancel in-flight requests.
 */
export class MinifluxClient {
  private config: RequestConfig;

  constructor(config: RequestConfig) {
    this.config = config;
  }

  /** Replace the active credentials (e.g. after a token refresh). */
  setConfig(config: RequestConfig): void {
    this.config = config;
  }

  // ---- Feeds --------------------------------------------------------------

  getFeeds(signal?: AbortSignal): Promise<Feed[]> {
    return request<Feed[]>(this.config, {
      path: "/v1/feeds",
      signal,
    });
  }

  getCategoryFeeds(categoryId: number, signal?: AbortSignal): Promise<Feed[]> {
    return request<Feed[]>(this.config, {
      path: `/v1/categories/${categoryId}/feeds`,
      signal,
    });
  }

  getFeed(feedId: number, signal?: AbortSignal): Promise<Feed> {
    return request<Feed>(this.config, {
      path: `/v1/feeds/${feedId}`,
      signal,
    });
  }

  createFeed(
    params: CreateFeedRequest,
    signal?: AbortSignal,
  ): Promise<CreateFeedResponse> {
    return request<CreateFeedResponse>(this.config, {
      method: "POST",
      path: "/v1/feeds",
      body: params,
      signal,
    });
  }

  updateFeed(
    feedId: number,
    params: UpdateFeedRequest,
    signal?: AbortSignal,
  ): Promise<Feed> {
    return request<Feed>(this.config, {
      method: "PUT",
      path: `/v1/feeds/${feedId}`,
      body: params,
      signal,
    });
  }

  deleteFeed(feedId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "DELETE",
      path: `/v1/feeds/${feedId}`,
      signal,
    });
  }

  refreshFeed(feedId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: `/v1/feeds/${feedId}/refresh`,
      signal,
    });
  }

  refreshAllFeeds(signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: "/v1/feeds/refresh",
      signal,
    });
  }

  getFeedIcon(feedId: number, signal?: AbortSignal): Promise<Icon> {
    return request<Icon>(this.config, {
      path: `/v1/feeds/${feedId}/icon`,
      signal,
    });
  }

  getIcon(iconId: number, signal?: AbortSignal): Promise<Icon> {
    return request<Icon>(this.config, {
      path: `/v1/icons/${iconId}`,
      signal,
    });
  }

  // ---- Entries ------------------------------------------------------------

  getEntries(
    params?: EntryQueryParams,
    signal?: AbortSignal,
  ): Promise<EntryListResponse> {
    return request<EntryListResponse>(this.config, {
      path: "/v1/entries",
      query: entryQuery(params),
      signal,
    });
  }

  getFeedEntries(
    feedId: number,
    params?: EntryQueryParams,
    signal?: AbortSignal,
  ): Promise<EntryListResponse> {
    return request<EntryListResponse>(this.config, {
      path: `/v1/feeds/${feedId}/entries`,
      query: entryQuery(params),
      signal,
    });
  }

  getCategoryEntries(
    categoryId: number,
    params?: EntryQueryParams,
    signal?: AbortSignal,
  ): Promise<EntryListResponse> {
    return request<EntryListResponse>(this.config, {
      path: `/v1/categories/${categoryId}/entries`,
      query: entryQuery(params),
      signal,
    });
  }

  getEntry(entryId: number, signal?: AbortSignal): Promise<Entry> {
    return request<Entry>(this.config, {
      path: `/v1/entries/${entryId}`,
      signal,
    });
  }

  getFeedEntry(
    feedId: number,
    entryId: number,
    signal?: AbortSignal,
  ): Promise<Entry> {
    return request<Entry>(this.config, {
      path: `/v1/feeds/${feedId}/entries/${entryId}`,
      signal,
    });
  }

  updateEntries(
    params: UpdateEntriesRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: "/v1/entries",
      body: params,
      signal,
    });
  }

  toggleBookmark(entryId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: `/v1/entries/${entryId}/bookmark`,
      signal,
    });
  }

  fetchOriginalContent(
    entryId: number,
    signal?: AbortSignal,
  ): Promise<FetchContentResponse> {
    return request<FetchContentResponse>(this.config, {
      path: `/v1/entries/${entryId}/fetch-content`,
      signal,
    });
  }

  // ---- Mark-all-as-read ---------------------------------------------------

  markFeedAsRead(feedId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: `/v1/feeds/${feedId}/mark-all-as-read`,
      signal,
    });
  }

  markCategoryAsRead(categoryId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: `/v1/categories/${categoryId}/mark-all-as-read`,
      signal,
    });
  }

  markAllAsRead(userId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: `/v1/users/${userId}/mark-all-as-read`,
      signal,
    });
  }

  // ---- Categories ---------------------------------------------------------

  getCategories(counts?: boolean, signal?: AbortSignal): Promise<Category[]> {
    return request<Category[]>(this.config, {
      path: "/v1/categories",
      query: counts ? { counts: true } : undefined,
      signal,
    });
  }

  createCategory(
    params: CreateCategoryRequest,
    signal?: AbortSignal,
  ): Promise<Category> {
    return request<Category>(this.config, {
      method: "POST",
      path: "/v1/categories",
      body: params,
      signal,
    });
  }

  updateCategory(
    categoryId: number,
    params: UpdateCategoryRequest,
    signal?: AbortSignal,
  ): Promise<Category> {
    return request<Category>(this.config, {
      method: "PUT",
      path: `/v1/categories/${categoryId}`,
      body: params,
      signal,
    });
  }

  deleteCategory(categoryId: number, signal?: AbortSignal): Promise<void> {
    return request<void>(this.config, {
      method: "DELETE",
      path: `/v1/categories/${categoryId}`,
      signal,
    });
  }

  refreshCategoryFeeds(
    categoryId: number,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>(this.config, {
      method: "PUT",
      path: `/v1/categories/${categoryId}/refresh`,
      signal,
    });
  }

  // ---- Counters & User ----------------------------------------------------

  getCounters(signal?: AbortSignal): Promise<FeedCounters> {
    return request<FeedCounters>(this.config, {
      path: "/v1/feeds/counters",
      signal,
    });
  }

  getCurrentUser(signal?: AbortSignal): Promise<User> {
    return request<User>(this.config, {
      path: "/v1/me",
      signal,
    });
  }
}
