import { Tabs, router } from "expo-router";

import { EntryList } from "@/components/feed/entry-list";
import { HeaderActions } from "@/components/feed/feed-top-bar";
import { useEntries, useMarkAllEntriesRead } from "@/hooks/use-entries";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";
import { useMarkAsReadOnScroll, useStatusFilter } from "@/hooks/use-settings";

export default function HomeScreen() {
  const { data: statusFilter = "all" } = useStatusFilter();
  const { data: markAsReadOnScroll = false } = useMarkAsReadOnScroll();
  const entries = useEntries(statusFilter);
  const { isPending, mutate } = useRefreshEntries();
  const markAllRead = useMarkAllEntriesRead();

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
      />
    </>
  );
}
