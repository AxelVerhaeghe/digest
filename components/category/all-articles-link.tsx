import { StyleSheet } from "react-native";

import { Link } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { formatUnreadCount } from "@/hooks/use-unread-counts";
import { Badge } from "../ui/badge";
import { IconSymbol } from "../ui/icon-symbol";
import { ThemedView } from "../ui/themed-view";
import { ThemedText } from "../ui/themed-text";

interface Props {
  unreadCount: number;
}

export function AllArticlesLink({ unreadCount }: Props) {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].surfaceContainer;
  return (
    <Link href="/">
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={[styles.content, { backgroundColor }]}>
          <IconSymbol
            size={28}
            name="book.fill"
            color={Colors[colorScheme ?? "light"].primary}
            style={[
              styles.icon,
              {
                backgroundColor:
                  Colors[colorScheme ?? "light"].surfaceContainerHigh,
              },
            ]}
          />
          <ThemedView style={[styles.textContent, { backgroundColor }]}>
            <ThemedText>All Articles</ThemedText>
            <Badge>{`${formatUnreadCount(unreadCount)} unread entries`}</Badge>
          </ThemedView>
          <IconSymbol
            size={20}
            name="chevron.right"
            color={Colors[colorScheme ?? "light"].onSurfaceVariant}
          />
        </ThemedView>
      </ThemedView>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    width: "100%",
    borderRadius: 4,
  },
  content: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  textContent: {
    flex: 1,
  },
  icon: {
    padding: 8,
    borderRadius: 2,
  },
});
