import { Tabs, router } from "expo-router";

import { EmptyState } from "@/components/ui/empty-state";
import { EntryList } from "@/components/feed/entry-list";
import { HeaderActions } from "@/components/feed/feed-top-bar";
import { useEntries, useMarkAllEntriesRead } from "@/hooks/use-entries";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";
import {
  useMarkAsReadOnScroll,
  useSortOrder,
  useStatusFilter,
} from "@/hooks/use-settings";

export default function HomeScreen() {
  const { data: statusFilter = "all" } = useStatusFilter();
  const { data: sortOrder = "newest" } = useSortOrder();
  const { data: markAsReadOnScroll = false } = useMarkAsReadOnScroll();
  const entries = useEntries(statusFilter, sortOrder);
  const { isPending, mutate } = useRefreshEntries();
  const markAllRead = useMarkAllEntriesRead();

  const emptyState =
    statusFilter === "unread" ? (
      <EmptyState
        icon="checkmark.circle"
        title="All caught up"
        description="You've read everything. Nice work."
      />
    ) : (
      <EmptyState
        icon="newspaper"
        title="No articles yet"
        description="Your subscribed feeds will appear here once they sync."
      />
    );

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <HeaderActions
              onMarkAllRead={() => markAllRead.mutate()}
              onFilterPress={() => router.push("/preferences")}
            />
          ),
        }}
      />
      <EntryList
        data={entries.data}
        hasNextPage={entries.hasNextPage}
        fetchNextPage={entries.fetchNextPage}
        refreshing={isPending}
        onRefresh={mutate}
        markAsReadOnScroll={markAsReadOnScroll}
        emptyState={emptyState}
      />
    </>
  );
}
