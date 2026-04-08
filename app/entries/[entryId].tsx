import { useCallback, useMemo, useState } from "react";

import type { WebViewMessageEvent } from "react-native-webview";

import { ArticleHeader } from "@/components/article/article-header";
import { ArticleHero } from "@/components/article/article-hero";
import { ParallaxScrollView } from "@/components/layout/parallax-scroll-view";
import { IconButton } from "@/components/ui/icon-button";
import { ThemedView } from "@/components/ui/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useEntry,
  useMarkAsRead,
  useToggleBookmark,
  useToggleReadStatus,
} from "@/hooks/use-entries";
import { buildArticleHtml } from "@/lib/article-html";
import { useLocalSearchParams } from "expo-router";
import { Share, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const postHeight = `
  (function() {
    function postHeight() {
      var height = document.documentElement.scrollHeight;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: height }));
    }
    postHeight();
    new ResizeObserver(postHeight).observe(document.body);
  })();
  true;
`;

export default function Article() {
  const params = useLocalSearchParams<{ entryId: string }>();
  const entryId = parseInt(params.entryId);
  const { data } = useEntry(entryId);
  const toggleReadStatus = useToggleReadStatus(entryId, data?.status);
  const toggleBookmark = useToggleBookmark(entryId, data?.starred);
  const colorScheme = useColorScheme() ?? "light";
  const [webViewHeight, setWebViewHeight] = useState(0);

  useMarkAsRead(entryId, data?.status);

  const hasCoverImage = data?.cover_image_url != null;
  const content = data?.content;

  const html = content != null ? buildArticleHtml(content, colorScheme) : "";

  const onMessage = (event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === "height") {
      setWebViewHeight(message.value);
    }
  };

  if (!data) return null;

  return (
    <ParallaxScrollView
      headerBackground={<ArticleHero coverImageUrl={data.cover_image_url} />}
    >
      <ArticleHeader
        title={data.title}
        category={data.category}
        feedName={data.feed.title}
        hasImage={hasCoverImage}
        author={data.author}
        publishedAt={data.published_at}
        readingTime={data.reading_time}
        href={data.url}
        iconData={data.icon.data ?? undefined}
      >
        <IconButton
          icon={
            data.status === "unread"
              ? "checkmark.circle"
              : "checkmark.circle.fill"
          }
          onPress={() => toggleReadStatus.mutate()}
        />
        <IconButton
          icon={data.starred ? "bookmark.fill" : "bookmark"}
          onPress={() => toggleBookmark.mutate()}
        />
        <IconButton
          icon="square.and.arrow.up"
          onPress={() => Share.share({ url: data.url, message: data.url })}
        />
      </ArticleHeader>
      <ThemedView style={styles.content}>
        <WebView
          source={{ html }}
          style={[styles.webview, { height: webViewHeight }]}
          originWhitelist={["*"]}
          scrollEnabled={false}
          injectedJavaScript={postHeight}
          onMessage={onMessage}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  webview: {
    backgroundColor: "transparent",
  },
});
