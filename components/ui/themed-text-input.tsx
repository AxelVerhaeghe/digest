import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/ui/themed-text";

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  label?: string;
  error?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  placeholderTextColor,
  label,
  error,
  ...rest
}: ThemedTextInputProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "onSurface",
  );
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");
  const borderColor = useThemeColor({}, "outlineVariant");
  const errorColor = useThemeColor({}, "error");
  const defaultPlaceholderColor = useThemeColor({}, "onSurfaceVariant");
  const labelColor = useThemeColor({}, "onSurfaceVariant");

  const input = (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor,
          color,
          borderColor: error ? errorColor : borderColor,
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor ?? defaultPlaceholderColor}
      {...rest}
    />
  );

  if (!label && !error) {
    return input;
  }

  return (
    <View style={styles.field}>
      {label && (
        <ThemedText type="label" style={{ color: labelColor }}>
          {label}
        </ThemedText>
      )}
      {input}
      {error && (
        <ThemedText type="caption" style={{ color: errorColor }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: Fonts.families.manrope,
  },
});
