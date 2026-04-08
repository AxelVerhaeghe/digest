import { Stack, router, useLocalSearchParams } from "expo-router";

import { EntryList } from "@/components/feed/entry-list";
import { HeaderActions } from "@/components/feed/feed-top-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { useFeedEntries, useMarkAllFeedEntriesRead } from "@/hooks/use-entries";
import { useFeed } from "@/hooks/use-feeds";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";
import {
  useMarkAsReadOnScroll,
  useSortOrder,
  useStatusFilter,
} from "@/hooks/use-settings";

export default function Feed() {
  const { feedId } = useLocalSearchParams<{ feedId: string }>();
  const id = parseInt(feedId);

  const { data: statusFilter = "all" } = useStatusFilter();
  const { data: sortOrder = "newest" } = useSortOrder();
  const { data: markAsReadOnScroll = false } = useMarkAsReadOnScroll();
  const { data: feed } = useFeed(id);
  const entries = useFeedEntries(id, statusFilter, sortOrder);
  const { isPending, mutate } = useRefreshEntries(id);
  const markAllRead = useMarkAllFeedEntriesRead(id);

  const emptyState =
    statusFilter === "unread" ? (
      <EmptyState
        icon="checkmark.circle"
        title="All caught up"
        description="You've read everything in this feed."
      />
    ) : (
      <EmptyState
        icon="newspaper"
        title="No articles"
        description="This feed doesn't have any articles yet."
      />
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: feed?.title ?? "",
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
