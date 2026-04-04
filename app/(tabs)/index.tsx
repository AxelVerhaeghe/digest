import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import { feedsCollection } from "@/collections/feeds";
import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLiveQuery } from "@tanstack/react-db";

export default function HomeScreen() {
  const { data } = useLiveQuery((q) =>
    q.from({ feed: feedsCollection }).select(({ feed }) => ({
      id: feed.id,
      title: feed.title,
      category: feed.category,
    })),
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      {data.map((feed) => (
        <ThemedView key={feed.id}>
          <ThemedText type="subtitle">{feed.title}</ThemedText>
          <ThemedText>{feed.category.title}</ThemedText>
        </ThemedView>
      ))}
    </ParallaxScrollView>
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
