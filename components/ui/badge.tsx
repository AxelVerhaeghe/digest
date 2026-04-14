import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { TextProps } from "react-native";
import { StyleSheet, Text, View } from "react-native";

type BadgeProps = TextProps & {
  type?: "default" | "muted" | "primary";
};

export function Badge({
  type = "default",
  children,
  style,
  ...rest
}: BadgeProps) {
  const defaultColor = useThemeColor({}, "primary");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");
  const backgroundColor = useThemeColor({}, "surface");

  const color =
    type === "default" || type === "primary" ? defaultColor : mutedColor;

  return (
    <View style={type === "primary" && [styles.container, { backgroundColor }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingInline: 8,
    paddingBlock: 4,
    borderRadius: 12,
  },
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
