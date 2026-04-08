import type { ReactElement } from "react";
import { useMemo, useRef } from "react";
import type { ListRenderItemInfo } from "react-native";

import { useScrollToTop } from "@react-navigation/native";

import { FeedCard } from "@/components/feed/feed-card";
import { ThemedView } from "@/components/ui/themed-view";
import type { EntryListItem, PageResult } from "@/hooks/use-entries";
import { useMarkAsReadOnScrollHandler } from "@/hooks/use-entries";
import { FlatList, StyleSheet } from "react-native";
import type { InfiniteData } from "@tanstack/react-query";

type Props = {
  data: InfiniteData<PageResult> | undefined;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  markAsReadOnScroll?: boolean;
  emptyState?: ReactElement;
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
      status={item.status}
    />
  );
}

export function EntryList({
  data,
  hasNextPage,
  fetchNextPage,
  refreshing,
  onRefresh,
  markAsReadOnScroll,
  emptyState,
}: Props) {
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const handleEndReached = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const viewabilityConfigCallbackPairs =
    useMarkAsReadOnScrollHandler(markAsReadOnScroll);

  const listEmptyComponent = data !== undefined ? emptyState : undefined;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={listRef}
        data={flatData}
        keyExtractor={getItemKey}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          flatData.length === 0 && styles.listContentEmpty,
        ]}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        ListEmptyComponent={listEmptyComponent}
      />
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
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
