import { queryClient } from "@/lib/query-client";

export function invalidateEntries() {
  queryClient.invalidateQueries({ queryKey: ["entries"] });
  queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
}

export function invalidateFeeds() {
  queryClient.invalidateQueries({ queryKey: ["feeds"] });
}

export function invalidateCategories() {
  queryClient.invalidateQueries({ queryKey: ["categories"] });
}

export function invalidateAll() {
  queryClient.invalidateQueries();
}
