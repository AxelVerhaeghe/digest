import { EntryList } from "@/components/feed/entry-list";
import { useFeedEntries } from "@/hooks/use-entries";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";
import { useLocalSearchParams } from "expo-router";

export default function Feed() {
  const { feedId } = useLocalSearchParams<{ feedId: string }>();
  const id = parseInt(feedId);
  const entries = useFeedEntries(id);
  const { isPending, mutate } = useRefreshEntries(id);

  return <EntryList {...entries} refreshing={isPending} onRefresh={mutate} />;
}
