import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";

/**
 * Trigger a Miniflux feed refresh and re-sync entries locally.
 *
 * When `feedId` is provided, only that feed is refreshed on the server.
 * Otherwise all feeds are refreshed. After the server-side refresh
 * completes, the local entries cache is invalidated and awaited so
 * `isPending` stays `true` until fresh data has been fetched.
 */
export function useRefreshEntries(feedId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (feedId != null) {
        await api.refreshFeed(feedId);
      } else {
        await api.refreshAllFeeds();
      }
      await queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
