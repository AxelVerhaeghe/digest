import { categoriesCollection } from "@/collections/categories";
import { useLiveQuery } from "@tanstack/react-db";

export function useCategories() {
  return useLiveQuery((q) =>
    q.from({ category: categoriesCollection }).select(({ category }) => ({
      id: category.id,
      title: category.title,
      feed_count: category.feed_count,
      total_unread: category.total_unread,
    })),
  );
}
