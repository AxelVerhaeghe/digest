import type { RequestConfig } from "@/api/request";

import { MinifluxClient } from "./miniflux";

/**
 * Singleton Miniflux API client.
 *
 * The client starts unconfigured. Call {@link initializeApi} with valid
 * credentials before making any API requests (the login screen or the
 * startup credential-check handles this).
 */
export const api = new MinifluxClient({ baseUrl: "", token: "" });

/**
 * Configure the API client with the user's Miniflux credentials.
 * Must be called before any API requests are made.
 */
export function initializeApi(config: RequestConfig): void {
  api.setConfig(config);
}

/**
 * Clear the active API configuration after logout.
 */
export function resetApi(): void {
  api.setConfig({ baseUrl: "", token: "" });
}
