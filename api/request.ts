import { ApiError } from '@/api/errors';

// ---------------------------------------------------------------------------
// Configuration & option types
// ---------------------------------------------------------------------------

export type RequestConfig = {
  /** Miniflux instance base URL, e.g. `https://rss.example.com`. */
  baseUrl: string;
  /** API token sent via `X-Auth-Token` header. */
  token: string;
};

export type RequestOptions<T = unknown> = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  /**
   * Query parameters appended to the URL. `undefined` values are stripped
   * automatically. Arrays are appended as repeated keys (used by the `status`
   * filter).
   */
  query?: Record<string, string | number | boolean | string[] | undefined>;
  /** JSON-serialisable request body (used for POST / PUT). */
  body?: T;
  /** Optional abort signal for request cancellation. */
  signal?: AbortSignal;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip a single trailing slash so we can safely append `/v1/…` paths. */
function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Build a full URL from base + path + optional query params.
 *
 * Array values (e.g. `status: ['read', 'unread']`) are appended as repeated
 * keys, which is how Miniflux handles multi-value filters.
 */
function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions['query'],
): string {
  const url = new URL(path, normalizeBaseUrl(baseUrl));

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Try to parse a Miniflux JSON error body (`{ "error_message": "..." }`).
 * Returns `null` when the body is empty or not valid JSON.
 */
async function parseErrorBody(
  response: Response,
): Promise<string | null> {
  try {
    const body = await response.text();
    if (!body) return null;
    const json = JSON.parse(body) as { error_message?: string };
    return json.error_message ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

/**
 * Generic `fetch` wrapper for the Miniflux JSON API.
 *
 * - Injects `X-Auth-Token` and `Accept: application/json` headers.
 * - Adds `Content-Type: application/json` and serialises the body for
 *   POST / PUT requests.
 * - Returns `undefined` for `204 No Content` responses (typed as `void` at
 *   call sites).
 * - Throws {@link ApiError} for any non-2xx status.
 */
export async function request<T>(
  config: RequestConfig,
  options: RequestOptions,
): Promise<T> {
  const { method = 'GET', path, query, body, signal } = options;
  const url = buildUrl(config.baseUrl, path, query);

  const headers: Record<string, string> = {
    'X-Auth-Token': config.token,
    'Accept': 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const errorMessage = await parseErrorBody(response);
    throw new ApiError(response.status, errorMessage, url);
  }

  // 204 No Content — nothing to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
