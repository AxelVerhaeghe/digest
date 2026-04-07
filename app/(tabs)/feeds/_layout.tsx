import { Stack, router } from "expo-router";

import { IconButton } from "@/components/ui/icon-button";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function FeedsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { fontFamily: Fonts.families.newsreaderItalic },
        headerTintColor: theme.onSurface,
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: ({ canGoBack }) =>
          canGoBack && (
            <IconButton
              icon="arrow.left"
              variant="ghost"
              onPressIn={() => router.back()}
            />
          ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Feeds", headerShown: false }}
      />
      <Stack.Screen name="[feedId]" />
    </Stack>
  );
}
