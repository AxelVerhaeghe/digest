import { StyleSheet, View } from "react-native";

import { Image } from "expo-image";

import { ThemedText } from "@/components/ui/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type FeedIconProps = {
  iconData?: string;
  feedName: string;
  size?: number;
};

export function FeedIcon({ iconData, feedName, size = 20 }: FeedIconProps) {
  const placeholderBg = useThemeColor({}, "surfaceContainerHigh");
  const placeholderFg = useThemeColor({}, "onSurfaceVariant");

  const iconStyle = {
    width: size,
    height: size,
    borderRadius: Math.round(size / 5),
  };

  if (iconData) {
    return <Image source={{ uri: `data:${iconData}` }} style={iconStyle} />;
  }

  return (
    <View
      style={[
        iconStyle,
        styles.placeholder,
        { backgroundColor: placeholderBg },
      ]}
    >
      <ThemedText
        style={{
          color: placeholderFg,
          fontSize: Math.round(size * 0.55),
          fontWeight: "600",
          lineHeight: size,
        }}
      >
        {feedName.charAt(0).toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
