import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "@expo-google-fonts/newsreader";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, Fonts } from "@/constants/theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/db/database";
import migrations from "@/drizzle/migrations";
import { useSync } from "@/hooks/use-sync";
import { registerBackgroundSync } from "@/sync/background-task";
import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { IconButton } from "@/components/ui/icon-button";

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.surface,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.surface,
  },
};

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const sync = useSync();

  useEffect(() => {
    registerBackgroundSync().catch(() => {});
  }, []);

  if (sync.isInitialSync) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 16 }}>Syncing your feeds...</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entries/[entryId]"
          options={{
            title: "",
            headerTransparent: true,
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: ({ canGoBack }) =>
              canGoBack && (
                <IconButton
                  icon="arrow.left"
                  variant="muted"
                  onPressIn={() => router.back()}
                />
              ),
          }}
        />
        <Stack.Screen
          name="filter"
          options={{
            presentation: "formSheet",
            title: "Filters",
            sheetAllowedDetents: [0.35],
            sheetGrabberVisible: true,
            sheetCornerRadius: 16,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    ...Fonts.newsreader,
    ...Fonts.manrope,
  });
  const { success: migrationsReady, error: migrationError } = useMigrations(
    db,
    migrations,
  );

  useEffect(() => {
    if ((fontsLoaded || fontError) && migrationsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, migrationsReady]);

  if ((!fontsLoaded && !fontError) || !migrationsReady) {
    return null;
  }

  if (migrationError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Migration error: {migrationError.message}</ThemedText>
      </View>
    );
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : LightTheme}
    >
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
