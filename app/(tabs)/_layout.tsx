import { Tabs } from "expo-router";
import React from "react";

import { StyleSheet } from "react-native";

import { HapticTab } from "@/components/layout/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors[colorScheme ?? "light"].outlineVariant,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "All",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: "Feeds",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
