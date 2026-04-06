import type { ComponentProps } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

const BUTTON_SIZE = 40;
const ICON_SIZE = 20;

const TIMING_CONFIG = { duration: 100 };
const SCALE_PRESSED = 0.95;
const SCALE_DEFAULT = 1;
const OPACITY_PRESSED = 0.7;
const OPACITY_DEFAULT = 1;

type IconButtonProps = Omit<PressableProps, "style"> & {
  icon: ComponentProps<typeof IconSymbol>["name"];
  lightColor?: string;
  darkColor?: string;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  lightColor,
  darkColor,
  haptic = true,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: IconButtonProps) {
  const backgroundColor = useThemeColor({}, "surfaceContainerHigh");
  const borderColor = useThemeColor({}, "outlineVariant");
  const iconColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "onSurface",
  );

  const scale = useSharedValue(SCALE_DEFAULT);
  const opacity = useSharedValue(OPACITY_DEFAULT);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={(ev) => {
          scale.value = withTiming(SCALE_PRESSED, TIMING_CONFIG);
          opacity.value = withTiming(OPACITY_PRESSED, TIMING_CONFIG);

          if (haptic && process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          onPressIn?.(ev);
        }}
        onPressOut={(ev) => {
          scale.value = withTiming(SCALE_DEFAULT, TIMING_CONFIG);
          opacity.value = withTiming(OPACITY_DEFAULT, TIMING_CONFIG);

          onPressOut?.(ev);
        }}
        style={[styles.button, { backgroundColor, borderColor }, style]}
        {...rest}
      >
        <IconSymbol name={icon} size={ICON_SIZE} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
