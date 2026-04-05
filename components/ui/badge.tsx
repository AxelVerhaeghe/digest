import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { TextProps } from "react-native";
import { StyleSheet, Text } from "react-native";

type BadgeProps = TextProps & {
  type?: "default" | "muted";
};

export function Badge({
  type = "default",
  children,
  style,
  ...rest
}: BadgeProps) {
  const defaultColor = useThemeColor({}, "primary");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");

  const color = type === "default" ? defaultColor : mutedColor;

  return (
    <Text
      style={[
        styles.base,
        type === "default" ? styles.default : styles.muted,
        { color },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 11,
    lineHeight: 14,
  },
  default: {
    fontFamily: Fonts.families.manropeMedium,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  muted: {
    fontFamily: Fonts.families.manrope,
    opacity: 0.7,
  },
});
