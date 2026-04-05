import type { PropsWithChildren, ReactElement } from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

const HEADER_HEIGHT_RATIO = 0.6;
const PARALLAX_SPEED = 0.25;

type ParallaxScrollViewProps = PropsWithChildren<{
  headerBackground: ReactElement;
  contentStyle?: ViewStyle;
}>;

export function ParallaxScrollView({
  children,
  headerBackground,
  contentStyle,
}: ParallaxScrollViewProps) {
  const { height: windowHeight } = useWindowDimensions();
  const headerHeight = Math.round(windowHeight * HEADER_HEIGHT_RATIO);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [headerHeight / 2, 0, -headerHeight * PARALLAX_SPEED],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.headerBackground,
          { height: headerHeight },
          imageAnimatedStyle,
        ]}
      >
        {headerBackground}
      </Animated.View>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: headerHeight }} />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 500,
  },
});
