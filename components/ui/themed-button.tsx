import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/ui/themed-text";

const TIMING_CONFIG = { duration: 100 };
const SCALE_PRESSED = 0.98;
const SCALE_DEFAULT = 1;
const OPACITY_PRESSED = 0.7;
const OPACITY_DEFAULT = 1;

export type ThemedButtonProps = Omit<PressableProps, "children" | "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ThemedButton({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ThemedButtonProps) {
  const primaryBg = useThemeColor({}, "primary");
  const primaryFg = useThemeColor({}, "onPrimary");
  const secondaryBg = useThemeColor({}, "secondaryContainer");
  const secondaryFg = useThemeColor({}, "onSecondaryContainer");
  const destructiveBg = useThemeColor({}, "error");
  const destructiveFg = useThemeColor({}, "onError");

  const colorsByVariant = {
    primary: { backgroundColor: primaryBg, foregroundColor: primaryFg },
    secondary: {
      backgroundColor: secondaryBg,
      foregroundColor: secondaryFg,
    },
    destructive: {
      backgroundColor: destructiveBg,
      foregroundColor: destructiveFg,
    },
  } as const;

  const { backgroundColor, foregroundColor } = colorsByVariant[variant];

  const scale = useSharedValue(SCALE_DEFAULT);
  const opacity = useSharedValue(OPACITY_DEFAULT);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function handlePressIn(ev: GestureResponderEvent) {
    scale.value = withTiming(SCALE_PRESSED, TIMING_CONFIG);
    opacity.value = withTiming(OPACITY_PRESSED, TIMING_CONFIG);
    onPressIn?.(ev);
  }

  function handlePressOut(ev: GestureResponderEvent) {
    scale.value = withTiming(SCALE_DEFAULT, TIMING_CONFIG);
    opacity.value = withTiming(OPACITY_DEFAULT, TIMING_CONFIG);
    onPressOut?.(ev);
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor },
          (disabled || loading) && styles.disabled,
          style,
        ]}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={foregroundColor} size="small" />
        ) : (
          <ThemedText style={[styles.label, { color: foregroundColor }]}>
            {title}
          </ThemedText>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.families.manropeSemiBold,
  },
});
