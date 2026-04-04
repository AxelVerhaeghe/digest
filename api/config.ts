import type { RequestConfig } from '@/api/request';

/**
 * Read Miniflux API connection config from environment variables.
 *
 * Currently reads from `EXPO_PUBLIC_MINIFLUX_*` env vars set at build time.
 * When a user-facing settings screen is added, swap this implementation to
 * read from secure storage / async storage instead — the return type stays
 * the same so callers won't need to change.
 */
export function getMinifluxConfig(): RequestConfig {
  const baseUrl = process.env.EXPO_PUBLIC_MINIFLUX_BASE_URL;
  const token = process.env.EXPO_PUBLIC_MINIFLUX_API_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      'Missing EXPO_PUBLIC_MINIFLUX_BASE_URL or EXPO_PUBLIC_MINIFLUX_API_TOKEN environment variables. ' +
        'Copy .env.example to .env.local and fill in your Miniflux instance details.',
    );
  }

  return { baseUrl, token };
}
