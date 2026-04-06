import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

import { AllArticlesLink } from "@/components/category/all-articles-link";
import { Collapsible } from "@/components/ui/collapsible";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useCategories } from "@/hooks/use-categories";
import { useFeeds } from "@/hooks/use-feeds";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Link } from "expo-router";

export default function FeedsScreen() {
  const { data: categories } = useCategories();
  const { data: feeds } = useFeeds();
  const placeholderBg = useThemeColor({}, "surfaceContainerHigh");
  const placeholderFg = useThemeColor({}, "onSurfaceVariant");

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
                        {feed.icon.data ? (
                          <Image
                            source={{
                              uri: `data:${feed.icon.data}`,
                            }}
                            style={styles.feedIcon}
                          />
                        ) : (
                          <View
                            style={[
                              styles.feedIcon,
                              styles.feedIconPlaceholder,
                              { backgroundColor: placeholderBg },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.feedIconLetter,
                                { color: placeholderFg },
                              ]}
                            >
                              {feed.title.charAt(0).toUpperCase()}
                            </ThemedText>
                          </View>
                        )}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  feedIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  feedIconPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  feedIconLetter: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 20,
  },
});
