import { Tabs, router } from "expo-router";

import { EntryList } from "@/components/feed/entry-list";
import { HeaderActions } from "@/components/feed/feed-top-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";
import { useMarkAsReadOnScroll, useSortOrder } from "@/hooks/use-settings";
import { useStarredEntries } from "@/hooks/use-entries";

export default function SavedScreen() {
  const { data: sortOrder = "newest" } = useSortOrder();
  const { data: markAsReadOnScroll = false } = useMarkAsReadOnScroll();
  const entries = useStarredEntries(sortOrder);
  const { isPending, mutate } = useRefreshEntries();

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <HeaderActions onFilterPress={() => router.push("/preferences")} />
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
        emptyState={
          <EmptyState
            icon="bookmark"
            title="No saved articles"
            description="Articles you bookmark will appear here for easy access."
          />
        }
      />
    </>
  );
}
