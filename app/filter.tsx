import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type SortOrder = "newest" | "oldest";
type StatusFilter = "all" | "unread";

type OptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  selectedColor: string;
  unselectedColor: string;
  borderColor: string;
};

function OptionRow({
  label,
  selected,
  onPress,
  selectedColor,
  unselectedColor,
  borderColor,
}: OptionRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.optionRow}>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? selectedColor : borderColor },
        ]}
      >
        {selected && (
          <View
            style={[styles.radioFill, { backgroundColor: selectedColor }]}
          />
        )}
      </View>
      <ThemedText
        style={[
          styles.optionLabel,
          { color: selected ? selectedColor : unselectedColor },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function FilterScreen() {
  const backgroundColor = useThemeColor({}, "surfaceContainerHigh");
  const sectionColor = useThemeColor({}, "onSurfaceVariant");
  const selectedColor = useThemeColor({}, "primary");
  const unselectedColor = useThemeColor({}, "onSurface");
  const borderColor = useThemeColor({}, "outlineVariant");

  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: sectionColor }]}>
          Sort order
        </ThemedText>
        <OptionRow
          label="Newest first"
          selected={sortOrder === "newest"}
          onPress={() => setSortOrder("newest")}
          selectedColor={selectedColor}
          unselectedColor={unselectedColor}
          borderColor={borderColor}
        />
        <OptionRow
          label="Oldest first"
          selected={sortOrder === "oldest"}
          onPress={() => setSortOrder("oldest")}
          selectedColor={selectedColor}
          unselectedColor={unselectedColor}
          borderColor={borderColor}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: sectionColor }]}>
          Show
        </ThemedText>
        <OptionRow
          label="All entries"
          selected={statusFilter === "all"}
          onPress={() => setStatusFilter("all")}
          selectedColor={selectedColor}
          unselectedColor={unselectedColor}
          borderColor={borderColor}
        />
        <OptionRow
          label="Unread only"
          selected={statusFilter === "unread"}
          onPress={() => setStatusFilter("unread")}
          selectedColor={selectedColor}
          unselectedColor={unselectedColor}
          borderColor={borderColor}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 16,
  },
});
