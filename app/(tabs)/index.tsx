import { EntryList } from "@/components/feed/entry-list";
import { useEntries } from "@/hooks/use-entries";

export default function HomeScreen() {
  const entries = useEntries();

  return <EntryList {...entries} />;
}
