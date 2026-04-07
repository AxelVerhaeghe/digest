import { StyleSheet, Text, type TextProps } from "react-native";

import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "label"
    | "caption";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "onSurface",
  );
  const linkColor = useThemeColor({}, "primary");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? [styles.link, { color: linkColor }] : undefined,
        type === "label" ? styles.label : undefined,
        type === "caption" ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.families.newsreader,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.families.newsreaderSemiBold,
  },
  title: {
    fontSize: 48,
    lineHeight: 52.8,
    fontFamily: Fonts.families.newsreaderBoldItalic,
  },
  subtitle: {
    fontSize: 30,
    fontFamily: Fonts.families.newsreaderBoldItalic,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: Fonts.families.newsreader,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: Fonts.families.manropeSemiBold,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.families.manrope,
  },
});
