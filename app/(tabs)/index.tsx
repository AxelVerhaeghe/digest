import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useFeeds } from "@/hooks/use-feeds";

export default function HomeScreen() {
  const { data } = useFeeds();
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
      </ThemedView>
      {data.map((feed) => (
        <ThemedView key={feed.id}>
          <ThemedText type="subtitle">{feed.title}</ThemedText>
          <ThemedText>{feed.category.title}</ThemedText>
        </ThemedView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
