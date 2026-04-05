import { StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export function DotSeparator() {
  const color = useThemeColor({}, "onSurfaceVariant");

  return (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.dot, { backgroundColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
});
