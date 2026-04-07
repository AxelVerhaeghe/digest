import { StyleSheet, View } from "react-native";

import { IconButton } from "@/components/ui/icon-button";

type HeaderActionsProps = {
  onMarkAllRead: () => void;
  onFilterPress: () => void;
};

export function HeaderActions({
  onMarkAllRead,
  onFilterPress,
}: HeaderActionsProps) {
  return (
    <View style={styles.actions}>
      <IconButton
        icon="checkmark.message"
        variant="ghost"
        onPress={onMarkAllRead}
      />
      <IconButton
        icon="line.3.horizontal.decrease"
        variant="ghost"
        onPress={onFilterPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
