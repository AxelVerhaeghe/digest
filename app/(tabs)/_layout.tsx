import { Tabs } from "expo-router";
import React from "react";

import { StyleSheet } from "react-native";

import { HapticTab } from "@/components/layout/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        headerShown: true,
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { fontFamily: Fonts.families.newsreaderItalic },
        headerTintColor: theme.onSurface,
        headerShadowVisible: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.outlineVariant,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "All Articles",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: "Feeds",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bookmark.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
