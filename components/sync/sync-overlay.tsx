import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackfillSyncIndicator } from "@/components/ui/backfill-sync-indicator";
import { IncrementalSyncProgressBar } from "@/components/ui/incremental-sync-progress-bar";
import { ThemedText } from "@/components/ui/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSync } from "@/hooks/use-sync";
import { registerBackgroundSync } from "@/sync/background-task";

export function SyncOverlay() {
  const sync = useSync();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    registerBackgroundSync().catch(() => {});
  }, []);

  if (sync.isInitialSync) {
    return (
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.initialSyncText}>
            Syncing your feeds...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <>
      {sync.isSyncing && !sync.isInitialSync && !sync.isBackfilling && (
        <IncrementalSyncProgressBar top={insets.top} />
      )}
      {sync.isBackfilling && (
        <BackfillSyncIndicator
          progress={sync.backfillProgress ?? { fetched: 0, total: null }}
          bottom={insets.bottom + 84}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initialSyncText: {
    marginTop: 16,
  },
});
