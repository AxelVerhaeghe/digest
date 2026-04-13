import { useFonts } from "@expo-google-fonts/newsreader";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { initializeApi } from "@/api";
import { LoginScreen } from "@/components/login/login-screen";
import { SyncOverlay } from "@/components/sync/sync-overlay";
import { IconButton } from "@/components/ui/icon-button";
import { ThemedText } from "@/components/ui/themed-text";
import { Colors, Fonts } from "@/constants/theme";
import { db } from "@/db/database";
import migrations from "@/drizzle/migrations";
import { useCredentials } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { queryClient } from "@/lib/query-client";

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
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { data: credentials, isLoading } = useCredentials();

  useEffect(() => {
    if (credentials) {
      initializeApi(credentials);
    }
  }, [credentials]);

  const authStatus = credentials
    ? "authenticated"
    : isLoading
      ? "checking"
      : "needs-login";

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
          name="settings"
          options={{
            title: "Settings",
            headerShown: true,
            headerStyle: { backgroundColor: theme.surface },
            headerTitleStyle: { fontFamily: Fonts.families.newsreaderItalic },
            headerTintColor: theme.onSurface,
            headerShadowVisible: false,
            headerLeft: ({ canGoBack }) =>
              canGoBack && (
                <IconButton
                  icon="arrow.left"
                  variant="ghost"
                  onPressIn={() => router.back()}
                />
              ),
          }}
        />
      </Stack>
      <StatusBar style="auto" />

      {authStatus === "authenticated" && <SyncOverlay />}

      {authStatus !== "authenticated" && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]}
        >
          {authStatus === "needs-login" && <LoginScreen />}
        </View>
      )}
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
      <View style={styles.centered}>
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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
