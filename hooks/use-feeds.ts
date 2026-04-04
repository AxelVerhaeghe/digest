import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

export function useFeeds() {
  return useQuery({
    queryKey: ["feeds"],
    queryFn: () => api.getFeeds(),
  });
}
