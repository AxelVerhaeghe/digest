import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type CollapsibleProps = PropsWithChildren<{
  title: string;
  initiallyOpen?: boolean;
}>;

export function Collapsible({
  children,
  title,
  initiallyOpen,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen ?? false);
  const theme = useColorScheme() ?? "light";

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={
            theme === "light"
              ? Colors.light.onSurfaceVariant
              : Colors.dark.onSurfaceVariant
          }
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "space-between",
    paddingBlock: 16,
    width: "100%",
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
