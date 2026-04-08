import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Wraps React Native's `useColorScheme` and narrows the return type to
 * `"light" | "dark"`. As of RN 0.83 the native hook can also return
 * `"unspecified"`, which we treat as `"light"`.
 */
export function useColorScheme(): "light" | "dark" {
  const scheme = useRNColorScheme();
  return scheme === "dark" ? "dark" : "light";
}
