import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { incrementalSync } from "@/sync/sync-engine";

/**
 * Trigger a Miniflux feed refresh and re-sync entries locally.
 *
 * When `feedId` is provided, only that feed is refreshed on the server.
 * Otherwise all feeds are refreshed. After the server-side refresh
 * completes, an incremental sync pulls new entries into SQLite and
 * invalidates the relevant query keys.
 */
export function useRefreshEntries(feedId?: number) {
  return useMutation({
    mutationFn: async () => {
      if (feedId != null) {
        await api.refreshFeed(feedId);
      } else {
        await api.refreshAllFeeds();
      }
      await incrementalSync();
    },
  });
}
