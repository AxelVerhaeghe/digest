import { useCallback, useState } from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";
import { Image } from "expo-image";

type CoverImageStatus = "loading" | "success" | "error";

type CoverImageProps = {
  url: string;
  style?: ViewStyle;
};

export function CoverImage({ url, style }: CoverImageProps) {
  const [status, setStatus] = useState<CoverImageStatus>("loading");

  const handleLoad = useCallback(() => setStatus("success"), []);
  const handleError = useCallback(() => setStatus("error"), []);

  if (status === "error") return null;

  return (
    <View style={[styles.wrapper, style]}>
      {status === "loading" && <Skeleton style={styles.skeleton} />}
      <Image
        source={url}
        style={[styles.image, status === "loading" && styles.hidden]}
        onLoad={handleLoad}
        onError={handleError}
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
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  hidden: {
    opacity: 0,
  },
});
