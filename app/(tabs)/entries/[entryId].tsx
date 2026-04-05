import { useCallback, useMemo, useState } from "react";

import type { WebViewMessageEvent } from "react-native-webview";

import { ArticleHeader } from "@/components/article/article-header";
import { ArticleHero } from "@/components/article/article-hero";
import { ParallaxScrollView } from "@/components/layout/parallax-scroll-view";
import { ThemedView } from "@/components/ui/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEntry } from "@/hooks/use-entries";
import { buildArticleHtml } from "@/lib/article-html";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const INJECTED_JS = `
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
  const colorScheme = useColorScheme() ?? "light";
  const [webViewHeight, setWebViewHeight] = useState(0);

  const hasCoverImage = data?.cover_image_url != null;
  const content = data?.content;

  const html = useMemo(
    () =>
      content != null
        ? buildArticleHtml(content, colorScheme, hasCoverImage)
        : "",
    [content, colorScheme, hasCoverImage],
  );

  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === "height") {
      setWebViewHeight(message.value);
    }
  }, []);

  if (!data) return null;

  return (
    <ParallaxScrollView
      headerBackground={<ArticleHero coverImageUrl={data.cover_image_url} />}
    >
      <ArticleHeader
        title={data.title}
        category={data.category}
        hasImage={hasCoverImage}
        author={data.author}
        publishedAt={data.published_at}
        readingTime={data.reading_time}
        href={data.url}
      />
      <ThemedView style={styles.content}>
        <WebView
          source={{ html }}
          style={[styles.webview, { height: webViewHeight }]}
          originWhitelist={["*"]}
          scrollEnabled={false}
          injectedJavaScript={INJECTED_JS}
          onMessage={onMessage}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 8,
  },
  webview: {
    backgroundColor: "transparent",
  },
});
