import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useFeeds } from "@/hooks/use-feeds";
import { Link } from "expo-router";
import { AllArticlesLink } from "@/components/category/all-articles-link";

export default function HomeScreen() {
  const { data } = useFeeds();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.allArticlesLink}>
          <AllArticlesLink unreadCount={10} />
        </ThemedView>
        {data.map((feed) => (
          <Link key={feed.id} href={`/feeds/${feed.id}`}>
            <ThemedView>
              <ThemedText type="subtitle">{feed.title}</ThemedText>
              <ThemedText>{feed.category.title}</ThemedText>
            </ThemedView>
          </Link>
        ))}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  allArticlesLink: {
    paddingBlockStart: 24,
    paddingBlockEnd: 16,
  },
});
