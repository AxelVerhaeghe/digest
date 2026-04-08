import * as SecureStore from "expo-secure-store";

import type { RequestConfig } from "@/api/request";

const KEY_BASE_URL = "miniflux_base_url";
const KEY_API_TOKEN = "miniflux_api_token";

/**
 * Retrieve stored Miniflux credentials from secure storage.
 * Returns `null` if either value is missing.
 */
export async function getCredentials(): Promise<RequestConfig | null> {
  const [baseUrl, token] = await Promise.all([
    SecureStore.getItemAsync(KEY_BASE_URL),
    SecureStore.getItemAsync(KEY_API_TOKEN),
  ]);

  if (!baseUrl || !token) {
    return null;
  }

  return { baseUrl, token };
}

/**
 * Persist Miniflux credentials to secure storage.
 */
export async function saveCredentials(
  baseUrl: string,
  token: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEY_BASE_URL, baseUrl),
    SecureStore.setItemAsync(KEY_API_TOKEN, token),
  ]);
}

/**
 * Remove stored credentials (used for logout / reset).
 */
export async function clearCredentials(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_BASE_URL),
    SecureStore.deleteItemAsync(KEY_API_TOKEN),
  ]);
}

/**
 * Quick check for whether credentials have been configured.
 */
export async function hasCredentials(): Promise<boolean> {
  const baseUrl = await SecureStore.getItemAsync(KEY_BASE_URL);
  return baseUrl !== null;
}
