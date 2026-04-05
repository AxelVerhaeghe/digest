import { StyleSheet } from "react-native";

import { DotSeparator } from "@/components/ui/dot-separator";
import { ThemedText } from "../ui/themed-text";
import { ThemedView } from "../ui/themed-view";
import { Image } from "expo-image";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Props {
  coverImageUrl: string | null;
  title: string;
  author: string | null;
  category: string;
  feedName: string;
  publishedAt: string;
}

export function FeedCard({
  coverImageUrl,
  title,
  author,
  category,
  feedName,
  publishedAt,
}: Props) {
  const publishDate = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
  });
  const metadata = [feedName, author, publishDate].filter(Boolean);

  return (
    <ThemedView style={styles.container}>
      <Badge>{category}</Badge>
      {!!coverImageUrl && (
        <Image source={coverImageUrl} style={styles.coverImage} />
      )}
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedView style={styles.metadata}>
        {metadata
          .flatMap((value, i) => [
            i > 0 && <DotSeparator key={`dot-${i}`} />,
            <Badge key={value} type="muted">
              {value}
            </Badge>,
          ])
          .filter(Boolean)}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    flex: 1,
    gap: 16,
  },
  coverImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginBlockEnd: 8,
    borderRadius: 4,
  },
  metadata: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
