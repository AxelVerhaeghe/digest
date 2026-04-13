import { StyleSheet, View } from "react-native";

import { IconButton } from "@/components/ui/icon-button";

type HeaderActionsProps = {
  onMarkAllRead?: () => void;
  onSettingsPress: () => void;
};

export function HeaderActions({
  onMarkAllRead,
  onSettingsPress,
}: HeaderActionsProps) {
  return (
    <View style={styles.actions}>
      {!!onMarkAllRead && (
        <IconButton
          icon="checkmark.message"
          variant="ghost"
          onPress={onMarkAllRead}
        />
      )}
      <IconButton icon="gearshape" variant="ghost" onPress={onSettingsPress} />
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
