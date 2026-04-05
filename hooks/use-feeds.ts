import { eq } from "@tanstack/db";
import { useLiveQuery } from "@tanstack/react-db";

import { feedsCollection } from "@/collections/feeds";
import { iconsCollection } from "@/collections/icons";

export function useFeeds() {
  return useLiveQuery((q) =>
    q
      .from({ feed: feedsCollection })
      .leftJoin({ icon: iconsCollection }, ({ feed, icon }) =>
        eq(feed.icon!.icon_id, icon.id),
      )
      .select(({ feed, icon }) => ({
        id: feed.id,
        title: feed.title,
        category: feed.category,
        icon: {
          data: icon.data,
          mime_type: icon.mime_type,
        },
      })),
  );
}
