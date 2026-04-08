import { StyleSheet, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";

type ArticleHeroProps = {
  coverImageUrl: string | null;
};

export function ArticleHero({ coverImageUrl }: ArticleHeroProps) {
  const solidBg = useThemeColor({}, "surfaceContainer");
  const iconColor = useThemeColor({}, "outlineVariant");
  const hasImage = coverImageUrl != null;

  const [imageLoaded, setImageLoaded] = useState(false);
  const handleLoad = useCallback(() => setImageLoaded(true), []);

  return (
    <View style={[styles.container, { backgroundColor: solidBg }]}>
      {hasImage ? (
        <>
          {!imageLoaded && <Skeleton style={styles.absoluteFill} />}
          <Image
            source={coverImageUrl}
            recyclingKey={coverImageUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            onLoad={handleLoad}
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
  absoluteFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
