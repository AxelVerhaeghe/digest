import { Stack, router, useLocalSearchParams } from "expo-router";

import { EntryList } from "@/components/feed/entry-list";
import { HeaderActions } from "@/components/feed/feed-top-bar";
import { useFeedEntries, useMarkAllFeedEntriesRead } from "@/hooks/use-entries";
import { useFeed } from "@/hooks/use-feeds";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";

export default function Feed() {
  const { feedId } = useLocalSearchParams<{ feedId: string }>();
  const id = parseInt(feedId);

  const { data: feed } = useFeed(id);
  const entries = useFeedEntries(id);
  const { isPending, mutate } = useRefreshEntries(id);
  const markAllRead = useMarkAllFeedEntriesRead(id);

  return (
    <>
      <Stack.Screen
        options={{
          title: feed?.title ?? "",
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
