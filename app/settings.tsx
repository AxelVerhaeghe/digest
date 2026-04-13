import { Alert, ScrollView, StyleSheet, View } from "react-native";

import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedSwitch } from "@/components/ui/themed-switch";
import { RadioGroup } from "@/components/ui/radio-group";
import { useLogoutMutation } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  useMarkAsReadOnScroll,
  useSortOrder,
  useStatusFilter,
  useUpdateMarkAsReadOnScroll,
  useUpdateSortOrder,
  useUpdateStatusFilter,
} from "@/hooks/use-settings";
import type { SortOrder, StatusFilter } from "@/hooks/use-settings";
const sortOptions = [
  { label: "Newest first", value: "newest" as const },
  { label: "Oldest first", value: "oldest" as const },
];

const showOptions = [
  { label: "All entries", value: "all" as const },
  { label: "Unread only", value: "unread" as const },
];

export default function SettingsScreen() {
  const backgroundColor = useThemeColor({}, "surface");
  const cardColor = useThemeColor({}, "surfaceContainer");
  const sectionColor = useThemeColor({}, "onSurfaceVariant");
  const borderColor = useThemeColor({}, "outlineVariant");

  const { data: sortOrder = "newest" } = useSortOrder();
  const updateSortOrder = useUpdateSortOrder();
  const { data: statusFilter = "all" } = useStatusFilter();
  const updateStatusFilter = useUpdateStatusFilter();
  const { data: markReadOnScroll = false } = useMarkAsReadOnScroll();
  const updateMarkReadOnScroll = useUpdateMarkAsReadOnScroll();

  const setSortOrder = (value: SortOrder) => {
    updateSortOrder.mutate(value);
  };

  const setStatusFilter = (value: StatusFilter) => {
    updateStatusFilter.mutate(value);
  };

  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onError: () => {
        Alert.alert(
          "Logout failed",
          "Digest couldn't clear local data. Please try again.",
        );
      },
    });
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log out?",
      "This will remove your Miniflux credentials and clear all local data on this device.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: handleLogout,
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <ThemedText
          type="subtitle"
          style={[styles.groupTitle, { color: sectionColor }]}
        >
          Content
        </ThemedText>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <RadioGroup
            label="Sort order"
            options={sortOptions}
            value={sortOrder}
            onChange={setSortOrder}
          />

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <RadioGroup
            label="Show"
            options={showOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="subtitle"
          style={[styles.groupTitle, { color: sectionColor }]}
        >
          Reading
        </ThemedText>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <ThemedText>Mark as read on scroll</ThemedText>
              <ThemedText type="caption" style={{ color: sectionColor }}>
                Automatically flag items as they leave the viewport.
              </ThemedText>
            </View>
            <ThemedSwitch
              value={markReadOnScroll}
              onValueChange={(value) => updateMarkReadOnScroll.mutate(value)}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="subtitle"
          style={[styles.groupTitle, { color: sectionColor }]}
        >
          Account
        </ThemedText>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <ThemedText type="caption" style={{ color: sectionColor }}>
            Logging out removes your saved credentials and wipes all locally
            cached articles, feeds, and preferences.
          </ThemedText>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <ThemedButton
            title={logoutMutation.isPending ? "Logging out..." : "Log out"}
            variant="destructive"
            loading={logoutMutation.isPending}
            onPress={confirmLogout}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 28,
  },
  section: {
    gap: 16,
  },
  groupTitle: {
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
    gap: 4,
  },
});
