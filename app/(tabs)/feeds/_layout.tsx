import { Stack } from "expo-router";

export default function FeedsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[feedId]" />
    </Stack>
  );
}
