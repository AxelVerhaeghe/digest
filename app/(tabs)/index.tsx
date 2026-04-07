import { Tabs, router } from "expo-router";

import { EntryList } from "@/components/feed/entry-list";
import { HeaderActions } from "@/components/feed/feed-top-bar";
import { useEntries, useMarkAllEntriesRead } from "@/hooks/use-entries";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";
import { useStatusFilter } from "@/hooks/use-settings";

export default function HomeScreen() {
  const { data: statusFilter = "all" } = useStatusFilter();
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
              onFilterPress={() => router.push("/filter")}
            />
          ),
        }}
      />
      <EntryList {...entries} refreshing={isPending} onRefresh={mutate} />
    </>
  );
}
