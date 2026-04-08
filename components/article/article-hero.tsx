import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DefaultImageBlurhash } from "@/constants/image";
import { useThemeColor } from "@/hooks/use-theme-color";

type ArticleHeroProps = {
  coverImageUrl: string | null;
};

export function ArticleHero({ coverImageUrl }: ArticleHeroProps) {
  const solidBg = useThemeColor({}, "surfaceContainer");
  const iconColor = useThemeColor({}, "outlineVariant");
  const hasImage = coverImageUrl != null;

  return (
    <View style={[styles.container, { backgroundColor: solidBg }]}>
      {hasImage ? (
        <>
          <View style={styles.fallback}>
            <IconSymbol name="photo" size={48} color={iconColor} />
          </View>
          <Image
            source={coverImageUrl}
            recyclingKey={coverImageUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            placeholder={DefaultImageBlurhash}
            placeholderContentFit="cover"
          />
          <LinearGradient
            colors={["transparent", solidBg]}
            locations={[0.5, 1]}
            style={styles.bottomGradient}
          />
        </>
      ) : (
        <View style={styles.fallback}>
          <IconSymbol name="newspaper" size={48} color={iconColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
});
