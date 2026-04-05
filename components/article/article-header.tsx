import { StyleSheet, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { ThemedText } from "@/components/ui/themed-text";
import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LinearGradient } from "expo-linear-gradient";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "@/components/navigation/external-link";
import type { ExternalUrl } from "@/collections/schemas";

const OVERLAP = 200;

type ArticleHeaderProps = {
  title: string;
  category: string;
  hasImage: boolean;
  author: string | null;
  publishedAt: string;
  readingTime: number;
  href: ExternalUrl;
};

export function ArticleHeader({
  title,
  category,
  hasImage,
  author,
  publishedAt,
  readingTime,
  href,
}: ArticleHeaderProps) {
  const surface = useThemeColor({}, "surface");
  const onSurface = useThemeColor({}, "onSurface");
  const onSurfaceVariant = useThemeColor({}, "onSurfaceVariant");

  const textColor = hasImage ? "#fff" : onSurface;
  const mutedTextColor = hasImage ? "rgba(255,255,255,0.7)" : onSurfaceVariant;

  const publishDate = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
  });
  const readTime = `${readingTime} min read`;

  return (
    <View style={[styles.container, hasImage && { marginTop: -OVERLAP }]}>
      {hasImage && (
        <LinearGradient
          colors={["transparent", surface, surface]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />
      )}
      <View style={styles.textContent}>
        <Badge
          style={{ color: hasImage ? "rgba(255,255,255,0.8)" : undefined }}
        >
          {category}
        </Badge>
        <ExternalLink href={href}>
          <ThemedText type="title" style={{ color: textColor }}>
            {title}
          </ThemedText>
        </ExternalLink>
        <View style={styles.metadata}>
          {author ? (
            <ThemedText
              style={[styles.metaText, { color: mutedTextColor }]}
              numberOfLines={2}
            >
              {author}
            </ThemedText>
          ) : null}
          <View style={styles.metaRight}>
            <ThemedText style={[styles.metaText, { color: mutedTextColor }]}>
              {publishDate}
            </ThemedText>
            <ThemedText style={[styles.metaDot, { color: mutedTextColor }]}>
              {"\u00B7"}
            </ThemedText>
            <ThemedText style={[styles.metaText, { color: mutedTextColor }]}>
              {readTime}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textContent: {
    padding: 16,
    gap: 8,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  metaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.families.manrope,
  },
  metaDot: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.families.manrope,
  },
});
