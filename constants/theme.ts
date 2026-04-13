/**
 * Material Design 3 color tokens derived from the editorial design system (DESIGN.md).
 *
 * The dark palette is the canonical "Silent Curator" theme — near-black charcoal
 * surfaces with a living forest-green undertone. Light palette is a placeholder
 * that mirrors the dark token names; replace the values when ready.
 */

import type { FontSource } from "expo-font";

import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Newsreader_700Bold,
  Newsreader_700Bold_Italic,
} from "@expo-google-fonts/newsreader";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { Platform } from "react-native";

/**
 * MD3 color tokens, keyed by light / dark scheme.
 *
 * Token naming follows the Material Design 3 tonal-palette convention:
 *   surface, onSurface, primary, onPrimary, primaryContainer, …
 */
export const Colors = {
  /* ------------------------------------------------------------------ */
  /*  Light — placeholder (mirrors dark token names, replace later)      */
  /* ------------------------------------------------------------------ */
  light: {
    // Surfaces
    surface: "#f5f8f7",
    surfaceDim: "#d9dedc",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f0f4f2",
    surfaceContainer: "#eaeeec",
    surfaceContainerHigh: "#e4e8e6",
    surfaceContainerHighest: "#dee3e0",

    // Primary
    primary: "#3a6b53",
    onPrimary: "#ffffff",
    primaryContainer: "#46564e",
    onPrimaryContainer: "#d5e8dd",

    // Secondary
    secondaryContainer: "#cdd8d2",
    onSecondaryContainer: "#3a4440",

    // Text
    onSurface: "#191c1b",
    onSurfaceVariant: "#414a47",

    // Utility
    outlineVariant: "#c0c9c4",
    inverseSurface: "#2e3130",
    inverseOnSurface: "#eff1ef",
    error: "#ba1a1a",
    onError: "#ffffff",
  },

  /* ------------------------------------------------------------------ */
  /*  Dark — canonical editorial palette from DESIGN.md                  */
  /* ------------------------------------------------------------------ */
  dark: {
    // Surfaces — tonal layers (Layer 0 → 3)
    surface: "#0f1413",
    surfaceDim: "#0b0f0e",
    surfaceContainerLowest: "#060908",
    surfaceContainerLow: "#111614",
    surfaceContainer: "#1b211f",
    surfaceContainerHigh: "#252b29",
    surfaceContainerHighest: "#303634",

    // Primary
    primary: "#b9cbc0",
    onPrimary: "#34443c",
    primaryContainer: "#46564e",
    onPrimaryContainer: "#d5e8dd",

    // Secondary
    secondaryContainer: "#3a4440",
    onSecondaryContainer: "#c4cec9",

    // Text
    onSurface: "#dee7e4",
    onSurfaceVariant: "#8a9691",

    // Utility
    outlineVariant: "#414a47",
    inverseSurface: "#dee7e4",
    inverseOnSurface: "#1b211f",
    error: "#cf6679",
    onError: "#ffffff",
  },
};

export const Fonts = {
  /**
   * Font map to pass to `useFonts()` for loading Newsreader variants.
   */
  newsreader: {
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
    Newsreader_700Bold,
    Newsreader_700Bold_Italic,
  } satisfies Record<string, FontSource>,

  /**
   * Font map to pass to `useFonts()` for loading Manrope variants.
   * Manrope is the sans-serif reserved for label scales (DESIGN.md §3).
   */
  manrope: {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  } satisfies Record<string, FontSource>,

  /**
   * Resolved font family names for use in styles.
   */
  families: {
    newsreader: "Newsreader_400Regular",
    newsreaderItalic: "Newsreader_400Regular_Italic",
    newsreaderMedium: "Newsreader_500Medium",
    newsreaderSemiBold: "Newsreader_600SemiBold",
    newsreaderBold: "Newsreader_700Bold",
    newsreaderBoldItalic: "Newsreader_700Bold_Italic",
    /** Sans-serif for label scales */
    manrope: "Manrope_400Regular",
    manropeMedium: "Manrope_500Medium",
    manropeSemiBold: "Manrope_600SemiBold",
    manropeBold: "Manrope_700Bold",
  },

  /**
   * Platform-specific system font families.
   */
  system: Platform.select({
    ios: {
      /** iOS `UIFontDescriptorSystemDesignDefault` */
      sans: "system-ui",
      /** iOS `UIFontDescriptorSystemDesignSerif` */
      serif: "ui-serif",
      /** iOS `UIFontDescriptorSystemDesignRounded` */
      rounded: "ui-rounded",
      /** iOS `UIFontDescriptorSystemDesignMonospaced` */
      mono: "ui-monospace",
    },
    default: {
      sans: "normal",
      serif: "serif",
      rounded: "normal",
      mono: "monospace",
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded:
        "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  }),
};
