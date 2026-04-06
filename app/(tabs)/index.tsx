import { EntryList } from "@/components/feed/entry-list";
import { useEntries } from "@/hooks/use-entries";
import { useRefreshEntries } from "@/hooks/use-refresh-entries";

export default function HomeScreen() {
  const entries = useEntries();
  const { isPending, mutate } = useRefreshEntries();

  return <EntryList {...entries} refreshing={isPending} onRefresh={mutate} />;
}
