import { StyleSheet, View } from "react-native";

import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/ui/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type EmptyStateProps = {
  icon: IconSymbolName;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const iconColor = useThemeColor({}, "onSurfaceVariant");

  return (
    <View style={styles.container}>
      <IconSymbol name={icon} size={48} color={iconColor} />
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText
        style={styles.description}
        lightColor={iconColor}
        darkColor={iconColor}
      >
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
    gap: 12,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});
