import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { feeds, icons } from "@/db/schema";

export type FeedListItem = {
  id: number;
  title: string;
  category: {
    id: number;
  };
  icon: {
    data: string | null;
    mime_type: string | null;
  };
};

/**
 * All subscribed feeds from the local store, joined with their icons.
 */
export function useFeeds() {
  return useQuery({
    queryKey: ["feeds"],
    queryFn: async (): Promise<FeedListItem[]> => {
      const rows = await db
        .select({
          id: feeds.id,
          title: feeds.title,
          category_id: feeds.category_id,
          icon_data: icons.data,
          icon_mime_type: icons.mime_type,
        })
        .from(feeds)
        .leftJoin(icons, eq(feeds.icon_id, icons.id));

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: {
          id: row.category_id,
        },
        icon: {
          data: row.icon_data,
          mime_type: row.icon_mime_type,
        },
      }));
    },
  });
}
