import type { ListRenderItemInfo } from "react-native";

import { FeedCard } from "@/components/feed/feed-card";
import { ThemedView } from "@/components/ui/themed-view";
import { useFeedEntries } from "@/hooks/use-entries";
import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FeedEntry = NonNullable<ReturnType<typeof useFeedEntries>["data"]>[number];

function getItemKey(item: FeedEntry) {
  return String(item.id);
}

function renderItem({ item }: ListRenderItemInfo<FeedEntry>) {
  return (
    <FeedCard
      coverImageUrl={item.cover_image_url}
      title={item.title}
      author={item.author}
      category={item.category}
      feedName={item.feed.title}
      publishedAt={item.published_at}
    />
  );
}

export default function Feed() {
  const { feedId } = useLocalSearchParams<{ feedId: string }>();
  const id = parseInt(feedId);
  const { data, fetchNextPage, hasNextPage } = useFeedEntries(id);

  const handleEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={getItemKey}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 64,
  },
});
