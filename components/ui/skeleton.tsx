import type { ViewStyle } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const SHIMMER_DURATION = 1200;

type SkeletonProps = {
  style?: ViewStyle;
};

export function Skeleton({ style }: SkeletonProps) {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];

  const base = palette.surfaceContainerHigh;
  const highlight = palette.surfaceContainerHighest;

  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION }),
      -1,
      false,
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value * 100}%` }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: base }, style]}>
      <AnimatedGradient
        colors={[base, highlight, base]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
