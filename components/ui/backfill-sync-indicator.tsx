import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { BackfillProgress } from "@/sync/sync-engine";

type BackfillSyncIndicatorProps = {
  progress: BackfillProgress;
  bottom: number;
};

export function BackfillSyncIndicator({
  progress,
  bottom,
}: BackfillSyncIndicatorProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const countText =
    progress.total != null
      ? `${progress.fetched.toLocaleString()} / ${progress.total.toLocaleString()}`
      : `${progress.fetched.toLocaleString()} articles`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          bottom,
          backgroundColor: theme.surfaceContainerLow,
          borderColor: theme.outlineVariant,
        },
      ]}
    >
      <ActivityIndicator size="small" color={theme.primary} />
      <View>
        <ThemedText type="label" style={{ color: theme.onSurface }}>
          Loading archive
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.onSurfaceVariant }}>
          {countText}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
});
