import type { ReactElement } from "react";
import { useMemo, useRef } from "react";

import { FlashList, type FlashListRef, type ListRenderItemInfo } from "@shopify/flash-list";
import { useScrollToTop } from "@react-navigation/native";

import { FeedCard } from "@/components/feed/feed-card";
import { ThemedView } from "@/components/ui/themed-view";
import type { EntryListItem, PageResult } from "@/hooks/use-entries";
import { useMarkAsReadOnScrollHandler } from "@/hooks/use-entries";
import { StyleSheet, View } from "react-native";
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

function getItemKey(item: EntryListItem, index: number) {
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

function getItemType(item: EntryListItem) {
  return item.cover_image_url ? "with-image" : "text-only";
}

function ItemSeparator() {
  return <View style={styles.separator} />;
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
  const listRef = useRef<FlashListRef<EntryListItem>>(null);
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
      <FlashList
        ref={listRef}
        data={flatData}
        keyExtractor={getItemKey}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
        getItemType={getItemType}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
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
  },
  separator: {
    height: 64,
  },
});
