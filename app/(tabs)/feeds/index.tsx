import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AllArticlesLink } from "@/components/category/all-articles-link";
import { Collapsible } from "@/components/ui/collapsible";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useCategories } from "@/hooks/use-categories";
import { useFeeds } from "@/hooks/use-feeds";
import { Link } from "expo-router";

export default function FeedsScreen() {
  const { data: categories } = useCategories();
  const { data: feeds } = useFeeds();

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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.allArticlesLink}>
            <AllArticlesLink unreadCount={10} />
          </ThemedView>
          {categories.map((category) => {
            const categoryFeeds = feedsByCategory.get(category.id);
            if (!categoryFeeds || categoryFeeds.length === 0) {
              return null;
            }
            return (
              <ThemedView key={category.id} style={styles.categorySection}>
                <Collapsible title={category.title} initiallyOpen>
                  {categoryFeeds.map((feed) => (
                    <Link key={feed.id} href={`/feeds/${feed.id}`}>
                      <ThemedView style={styles.feedItem}>
                        <ThemedText>{feed.title}</ThemedText>
                      </ThemedView>
                    </Link>
                  ))}
                </Collapsible>
              </ThemedView>
            );
          })}
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
  allArticlesLink: {
    paddingBlockStart: 24,
    paddingBlockEnd: 16,
  },
  categorySection: {
    marginBottom: 12,
  },
  feedItem: {
    paddingVertical: 8,
  },
});
