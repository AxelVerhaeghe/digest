import { useMemo, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { useScrollToTop } from "@react-navigation/native";

import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AllArticlesLink } from "@/components/category/all-articles-link";
import { Collapsible } from "@/components/ui/collapsible";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedIcon } from "@/components/ui/feed-icon";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useCategories } from "@/hooks/use-categories";
import { useFeeds } from "@/hooks/use-feeds";
import {
  formatUnreadCount,
  useAllUnreadCount,
  useUnreadCounts,
} from "@/hooks/use-unread-counts";
import { Badge } from "@/components/ui/badge";

export default function FeedsScreen() {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: feeds = [], isLoading: feedsLoading } = useFeeds();
  const { data: unreadByFeed } = useUnreadCounts();
  const { data: totalUnread = 0 } = useAllUnreadCount();

  const feedsByCategory = useMemo(() => {
    const map = new Map<number, typeof feeds>();
    for (const feed of feeds) {
      const categoryId = feed.category.id;
      const existing = map.get(categoryId);
      if (existing) {
        existing.push(feed);
      } else {
        map.set(categoryId, [feed]);
      }
    }
    return map;
  }, [feeds]);

  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const isLoading = categoriesLoading || feedsLoading;
  const isEmpty = !isLoading && feeds.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            isEmpty && styles.scrollContentEmpty,
          ]}
        >
          {isEmpty ? (
            <EmptyState
              icon="tray"
              title="No feeds yet"
              description="Subscribe to feeds from your Miniflux instance to get started."
            />
          ) : (
            <>
              <ThemedView style={styles.allArticlesLink}>
                <AllArticlesLink unreadCount={totalUnread} />
              </ThemedView>
              {categories.map((category) => {
                const categoryFeeds = feedsByCategory.get(category.id);
                if (!categoryFeeds || categoryFeeds.length === 0) {
                  return null;
                }
                return (
                  <ThemedView key={category.id} style={styles.categorySection}>
                    <Collapsible title={category.title} initiallyOpen>
                      {categoryFeeds.map((feed) => {
                        const feedUnreadCount =
                          unreadByFeed?.[String(feed.id)] ?? 0;
                        return (
                          <Link key={feed.id} href={`/feeds/${feed.id}`}>
                            <ThemedView style={styles.feedItem}>
                              <FeedIcon
                                iconData={feed.icon.data ?? undefined}
                                feedName={feed.title}
                                size={20}
                              />
                              <ThemedText style={styles.feedTitle}>
                                {feed.title}
                              </ThemedText>
                              {feedUnreadCount > 0 && (
                                <Badge type="muted">
                                  {formatUnreadCount(feedUnreadCount)}
                                </Badge>
                              )}
                            </ThemedView>
                          </Link>
                        );
                      })}
                    </Collapsible>
                  </ThemedView>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  allArticlesLink: {
    paddingBlockStart: 24,
    paddingBlockEnd: 16,
  },
  categorySection: {
    marginBottom: 12,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  feedTitle: {
    flex: 1,
  },
});
