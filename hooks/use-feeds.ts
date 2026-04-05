import { feedsCollection } from "@/collections/feeds";
import { useLiveQuery } from "@tanstack/react-db";

export function useFeeds() {
  return useLiveQuery((q) =>
    q.from({ feed: feedsCollection }).select(({ feed }) => ({
      id: feed.id,
      title: feed.title,
      category: feed.category,
    })),
  );
}
