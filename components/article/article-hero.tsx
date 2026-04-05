import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { useCallback, useState } from "react";

type ArticleHeroProps = {
  coverImageUrl: string | null;
};

export function ArticleHero({ coverImageUrl }: ArticleHeroProps) {
  const solidBg = useThemeColor({}, "surfaceContainer");
  const hasImage = coverImageUrl != null;

  const [imageLoaded, setImageLoaded] = useState(false);
  const handleLoad = useCallback(() => setImageLoaded(true), []);

  return (
    <View style={[styles.container, { backgroundColor: solidBg }]}>
      {hasImage && (
        <>
          {!imageLoaded && <Skeleton style={styles.absoluteFill} />}
          <Image
            source={coverImageUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onLoad={handleLoad}
          />
        </>
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
});
