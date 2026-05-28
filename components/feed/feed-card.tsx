import { StyleSheet } from "react-native";

import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/ui/cover-image";
import { DotSeparator } from "@/components/ui/dot-separator";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";

interface Props {
  coverImageUrl: string | null;
  title: string;
  author: string | null;
  category: string;
  feedName: string;
  publishedAt: string;
  id: number;
  status: "read" | "unread" | "removed";
}

export function FeedCard({
  coverImageUrl,
  title,
  author,
  category,
  feedName,
  publishedAt,
  id,
  status,
}: Props) {
  const publishDate = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
  });
  const metadata = [feedName, author, publishDate].filter(Boolean);

  return (
    <Link href={`/entries/${id}`}>
      <ThemedView
        style={[styles.container, status === "read" && { opacity: 0.5 }]}
      >
        <Badge>{category}</Badge>
        {!!coverImageUrl && <CoverImage url={coverImageUrl} />}
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
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    gap: 16,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
