import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "@expo-google-fonts/newsreader";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { IconButton } from "@/components/ui/icon-button";
import { getCredentials } from "@/lib/credentials";
import { initializeApi } from "@/api";
import { LoginScreen } from "@/components/login/login-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type AuthStatus = "checking" | "needs-login" | "authenticated";

/**
 * Full-screen overlay that runs sync after authentication.
 * Shows a loading indicator during initial sync; becomes
 * invisible once sync completes (children show through).
 * Displays a subtle top banner during background backfill.
 */
function SyncOverlay() {
  const sync = useSync();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    registerBackgroundSync().catch(() => {});
  }, []);

  if (sync.isInitialSync) {
    return (
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <ThemedText style={{ marginTop: 16 }}>
            Syncing your feeds...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (sync.isBackfilling && sync.backfillProgress) {
    const { fetched, total } = sync.backfillProgress;
    const progressText =
      total != null
        ? `Loading older articles... ${fetched.toLocaleString()} / ${total.toLocaleString()}`
        : `Loading older articles... ${fetched.toLocaleString()}`;

    return (
      <View
        style={[
          styles.backfillBanner,
          {
            top: insets.top,
            backgroundColor: theme.surfaceContainerHigh,
          },
        ]}
        pointerEvents="none"
      >
        <ActivityIndicator size="small" />
        <ThemedText
          style={[styles.backfillText, { color: theme.onSurfaceVariant }]}
        >
          {progressText}
        </ThemedText>
      </View>
    );
  }

  return null;
}

function AppContent() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  useEffect(() => {
    async function checkCredentials() {
      const credentials = await getCredentials();

      if (credentials) {
        initializeApi(credentials);
        setAuthStatus("authenticated");
      } else {
        setAuthStatus("needs-login");
      }
    }

    checkCredentials();
  }, []);

  function handleLogin(baseUrl: string, token: string) {
    initializeApi({ baseUrl, token });
    setAuthStatus("authenticated");
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
          name="preferences"
          options={{
            presentation: "formSheet",
            title: "Preferences",
            sheetAllowedDetents: [0.7],
            sheetGrabberVisible: true,
            sheetCornerRadius: 16,
          }}
        />
      </Stack>
      <StatusBar style="auto" />

      {authStatus === "authenticated" && <SyncOverlay />}

      {authStatus !== "authenticated" && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]}
        >
          {authStatus === "needs-login" && (
            <LoginScreen onLogin={handleLogin} />
          )}
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
  backfillBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  backfillText: {
    fontSize: 13,
  },
});
