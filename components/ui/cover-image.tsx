import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { Image } from "expo-image";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DefaultImageBlurhash } from "@/constants/image";
import { useThemeColor } from "@/hooks/use-theme-color";

type CoverImageProps = {
  url: string;
  style?: ViewStyle;
};

export function CoverImage({ url, style }: CoverImageProps) {
  const fallbackBg = useThemeColor({}, "surfaceContainerHigh");
  const fallbackFg = useThemeColor({}, "outlineVariant");

  return (
    <View style={[styles.wrapper, { backgroundColor: fallbackBg }, style]}>
      <View style={styles.fallback}>
        <IconSymbol name="photo" size={20} color={fallbackFg} />
      </View>
      <Image
        source={url}
        recyclingKey={url}
        style={styles.image}
        contentFit="cover"
        transition={200}
        placeholder={DefaultImageBlurhash}
        placeholderContentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 4,
    overflow: "hidden",
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
});
