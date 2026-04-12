import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const TOP_BAR_HEIGHT = 3;
const TOP_BAR_SEGMENT_WIDTH = Math.round(Dimensions.get("window").width * 0.35);
const TOP_BAR_TRAVEL_DISTANCE =
  Dimensions.get("window").width + TOP_BAR_SEGMENT_WIDTH;

type IncrementalSyncProgressBarProps = {
  top: number;
};

export function IncrementalSyncProgressBar({
  top,
}: IncrementalSyncProgressBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const translateX = useRef(new Animated.Value(-TOP_BAR_SEGMENT_WIDTH)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: TOP_BAR_TRAVEL_DISTANCE,
        duration: 950,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
      translateX.stopAnimation();
      translateX.setValue(-TOP_BAR_SEGMENT_WIDTH);
    };
  }, [translateX]);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.track,
        { top, backgroundColor: theme.surfaceContainerHigh },
      ]}
    >
      <Animated.View
        style={[
          styles.segment,
          {
            backgroundColor: theme.primary,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

export const INCREMENTAL_SYNC_BAR_HEIGHT = TOP_BAR_HEIGHT;

const styles = StyleSheet.create({
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    height: TOP_BAR_HEIGHT,
    overflow: "hidden",
  },
  segment: {
    width: TOP_BAR_SEGMENT_WIDTH,
    height: TOP_BAR_HEIGHT,
    borderRadius: TOP_BAR_HEIGHT,
  },
});
