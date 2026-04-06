import { StyleSheet, View } from "react-native";

import type { ExternalUrl } from "@/collections/schemas";
import { ExternalLink } from "@/components/navigation/external-link";
import { Badge } from "@/components/ui/badge";
import { FeedIcon } from "@/components/ui/feed-icon";
import { ThemedText } from "@/components/ui/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatDistanceToNow } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

const OVERLAP = 200;

type ArticleHeaderProps = {
  title: string;
  category: string;
  feedName: string;
  hasImage: boolean;
  author: string | null;
  publishedAt: string;
  readingTime: number;
  href: ExternalUrl;
  iconData?: string;
};

export function ArticleHeader({
  title,
  category,
  feedName,
  hasImage,
  author,
  publishedAt,
  readingTime,
  href,
  iconData,
}: ArticleHeaderProps) {
  const surface = useThemeColor({}, "surface");
  const onSurface = useThemeColor({}, "onSurface");
  const onSurfaceVariant = useThemeColor({}, "onSurfaceVariant");
  const borderColor = useThemeColor({}, "outlineVariant");

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
        <View style={[styles.metadata, { borderColor }]}>
          <View style={styles.metaLeft}>
            <FeedIcon iconData={iconData} feedName={feedName} size={28} />
            <View>
              {!!author && (
                <Badge style={[{ color: mutedTextColor }]} numberOfLines={1}>
                  {author}
                </Badge>
              )}
              <Badge
                type="muted"
                style={[{ color: mutedTextColor }]}
                numberOfLines={1}
              >
                {feedName}
              </Badge>
            </View>
          </View>
          <View style={styles.metaRight}>
            <Badge type="muted" style={[{ color: mutedTextColor }]}>
              {publishDate}
            </Badge>
            <Badge type="muted" style={[{ color: mutedTextColor }]}>
              {readTime}
            </Badge>
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
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    paddingBlock: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaLeft: {
    gap: 8,
    flexShrink: 1,
    flexDirection: "row",
  },
  metaRight: {
    gap: 6,
    flexShrink: 0,
  },
});
