import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export const COUNTERS_QUERY_KEY = ["counters"] as const;

export function formatUnreadCount(count: number): string {
  return count >= 100 ? "99+" : String(count);
}

const unreadCountQueryOptions = queryOptions({
  queryKey: COUNTERS_QUERY_KEY,
  queryFn: ({ signal }) => api.getCounters(signal),
  staleTime: 30_000,
});

export function useUnreadCounts() {
  return useQuery({
    ...unreadCountQueryOptions,
    select: (data) => data.unreads,
  });
}

export function useAllUnreadCount() {
  return useQuery({
    ...unreadCountQueryOptions,
    select: (data) =>
      Object.values(data.unreads).reduce((curr, acc) => (curr += acc), 0),
  });
}
