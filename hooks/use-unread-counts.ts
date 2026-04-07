import { useQuery } from "@tanstack/react-query";
import { eq, count as sqlCount } from "drizzle-orm";

import { db } from "@/db/database";
import { entries } from "@/db/schema";

export function formatUnreadCount(countValue: number): string {
  return countValue >= 100 ? "99+" : String(countValue);
}

/**
 * Per-feed unread counts from the local database.
 *
 * Returns a `Record<string, number>` keyed by feed ID (as string, to
 * match the previous implementation that keyed by string).
 */
export function useUnreadCounts() {
  return useQuery({
    queryKey: ["unread-counts"],
    queryFn: async (): Promise<Record<string, number>> => {
      const rows = await db
        .select({
          feed_id: entries.feed_id,
          count: sqlCount(),
        })
        .from(entries)
        .where(eq(entries.status, "unread"))
        .groupBy(entries.feed_id);

      const result: Record<string, number> = {};
      for (const row of rows) {
        result[String(row.feed_id)] = row.count;
      }
      return result;
    },
  });
}

/**
 * Total unread count across all feeds.
 */
export function useAllUnreadCount() {
  return useQuery({
    queryKey: ["unread-counts", "total"],
    queryFn: async (): Promise<number> => {
      const rows = await db
        .select({ count: sqlCount() })
        .from(entries)
        .where(eq(entries.status, "unread"));

      return rows[0]?.count ?? 0;
    },
  });
}
