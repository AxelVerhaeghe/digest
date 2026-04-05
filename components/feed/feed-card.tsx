import { StyleSheet } from "react-native";

import { ThemedText } from "../ui/themed-text";
import { ThemedView } from "../ui/themed-view";
import { Image } from "expo-image";

interface Props {
  coverImageUrl?: string | null;
  title: string;
  author: string;
}

export function FeedCard({ coverImageUrl, title, author }: Props) {
  return (
    <ThemedView style={styles.container}>
      {!!coverImageUrl && (
        <Image source={coverImageUrl} style={styles.coverImage} />
      )}
      <ThemedText>{author}</ThemedText>
      <ThemedText type="subtitle">{title}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    padding: 16,
  },
  coverImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginBlockEnd: 8,
    borderRadius: 4,
  },
});
