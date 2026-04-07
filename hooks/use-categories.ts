import { useQuery } from "@tanstack/react-query";

import { db } from "@/db/database";
import { categories } from "@/db/schema";

export type CategoryListItem = {
  id: number;
  title: string;
  feed_count: number | null;
  total_unread: number | null;
};

/**
 * All categories from the local store.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoryListItem[]> => {
      return db
        .select({
          id: categories.id,
          title: categories.title,
          feed_count: categories.feed_count,
          total_unread: categories.total_unread,
        })
        .from(categories);
    },
  });
}
