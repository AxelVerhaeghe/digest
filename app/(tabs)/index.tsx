import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useFeeds } from "@/hooks/use-feeds";

export default function HomeScreen() {
  const { data } = useFeeds();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome!</ThemedText>
        </ThemedView>
        {data.map((feed) => (
          <ThemedView key={feed.id}>
            <ThemedText type="subtitle">{feed.title}</ThemedText>
            <ThemedText>{feed.category.title}</ThemedText>
          </ThemedView>
        ))}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
