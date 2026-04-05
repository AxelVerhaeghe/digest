/**
 * Resolve a theme-aware color token.
 *
 * Accepts optional per-scheme overrides via `props`. When an override is not
 * provided, falls back to the named token in `Colors[scheme]`.
 *
 * @see https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/** Any token name that exists in both the light and dark palettes. */
type ColorToken = keyof typeof Colors.light & keyof typeof Colors.dark;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorToken,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
