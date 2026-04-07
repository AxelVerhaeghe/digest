import { useMemo } from "react";
import type { ListRenderItemInfo } from "react-native";

import { FeedCard } from "@/components/feed/feed-card";
import { ThemedView } from "@/components/ui/themed-view";
import type { EntryListItem } from "@/hooks/use-entries";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { InfiniteData } from "@tanstack/react-query";

type Props = {
  data: InfiniteData<EntryListItem[]> | undefined;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

function getItemKey(item: EntryListItem) {
  return String(item.id);
}

function renderItem({ item }: ListRenderItemInfo<EntryListItem>) {
  return (
    <FeedCard
      coverImageUrl={item.cover_image_url}
      title={item.title}
      author={item.author}
      category={item.feed.category.title}
      feedName={item.feed.title}
      publishedAt={item.published_at}
      id={item.id}
      status={item.status as "read" | "unread" | "removed"}
    />
  );
}

export function EntryList({
  data,
  hasNextPage,
  fetchNextPage,
  refreshing,
  onRefresh,
}: Props) {
  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data],
  );

  const handleEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={flatData}
          keyExtractor={getItemKey}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={3}
          windowSize={5}
          refreshing={refreshing}
          onRefresh={onRefresh}
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
