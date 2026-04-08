import { StyleSheet, View } from "react-native";

import { RadioGroup } from "@/components/ui/radio-group";
import { ThemedSwitch } from "@/components/ui/themed-switch";
import { ThemedText } from "@/components/ui/themed-text";
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

export default function PreferencesScreen() {
  const backgroundColor = useThemeColor({}, "surfaceContainer");
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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText
        type="subtitle"
        style={[styles.groupTitle, { color: sectionColor }]}
      >
        Filters
      </ThemedText>

      <RadioGroup
        label="Sort order"
        options={sortOptions}
        value={sortOrder}
        onChange={setSortOrder}
      />

      <RadioGroup
        label="Show"
        options={showOptions}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <ThemedText
        type="subtitle"
        style={[styles.groupTitle, { color: sectionColor }]}
      >
        Reading preferences
      </ThemedText>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <ThemedText>Mark as read on scroll</ThemedText>
          <ThemedText type="caption" style={{ color: sectionColor }}>
            Automatically flag items as they leave the viewport
          </ThemedText>
        </View>
        <ThemedSwitch
          value={markReadOnScroll}
          onValueChange={(value) => updateMarkReadOnScroll.mutate(value)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  groupTitle: {
    marginBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 12,
  },
});
