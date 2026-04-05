# AGENTS.md

## Project Overview

**Digest** is a local-first RSS reader app built as a mobile interface over a
[Miniflux](https://miniflux.app/) backend. The app syncs with a self-hosted Miniflux
instance but prioritizes offline reading -- entries, feeds, and read state are stored
locally so the UI works without a network connection. Syncing happens in the background
when connectivity is available.

Built with Expo (React Native) targeting iOS, Android, and web. Uses file-based routing
via Expo Router, React Navigation v7 with bottom tabs, and TypeScript with strict mode.
The React Compiler experiment is enabled. New Architecture is enabled.

**Stack:** React Native 0.81 / Expo SDK 54 / TypeScript 5.9 / React 19.1

### Architecture Principles

- **Local-first:** All reads come from the local database. Network requests sync data
  into the local store; the UI never waits on the network for rendering.
- **Miniflux is the source of truth for feed management:** Adding/removing feeds,
  categories, and OPML import/export go through the Miniflux API.
- **Read state syncs bidirectionally:** Mark-as-read/unread and starred status are
  written locally first, then pushed to Miniflux when online.

### Miniflux API

The backend is a Miniflux instance (https://miniflux.app/docs/api.html). Authentication
is via API token passed in the `X-Auth-Token` header. Key endpoints:

| Method | Endpoint                    | Purpose                         |
| ------ | --------------------------- | ------------------------------- |
| GET    | `/v1/feeds`                 | List subscribed feeds           |
| GET    | `/v1/feeds/{id}`            | Get a single feed               |
| GET    | `/v1/feeds/{id}/entries`    | Entries for a specific feed     |
| POST   | `/v1/feeds`                 | Subscribe to a new feed         |
| PUT    | `/v1/feeds/{id}`            | Update feed settings            |
| DELETE | `/v1/feeds/{id}`            | Unsubscribe from a feed         |
| GET    | `/v1/categories`            | List categories                 |
| GET    | `/v1/entries`               | List entries (supports filters) |
| GET    | `/v1/entries/{id}`          | Get a single entry              |
| PUT    | `/v1/entries`               | Batch update entry status       |
| PUT    | `/v1/entries/{id}/bookmark` | Toggle starred/bookmark         |
| GET    | `/v1/entries?status=unread` | Unread entries                  |
| GET    | `/v1/entries?starred=true`  | Starred entries                 |

Entries support query params: `status`, `direction`, `order`, `limit`, `offset`,
`after`, `before`, `category_id`, `starred`, `search`.

## Build & Run Commands

```bash
# Start the Expo dev server
npm start

# Platform-specific
npm run ios
npm run android
npm run web

# Lint (uses expo's eslint wrapper)
npm run lint            # equivalent to: expo lint

# Type-check (no separate script; run manually)
npx tsc --noEmit

# Reset to fresh project scaffold
npm run reset-project
```

### Testing

No test framework is configured yet. When adding tests, use the Expo-recommended
setup with Jest:

```bash
npm install --save-dev jest @testing-library/react-native jest-expo
```

Then add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

Run a single test file: `npx jest path/to/file.test.tsx`
Run tests matching a pattern: `npx jest -t "test name pattern"`

## Project Structure

```
app/                    # Expo Router file-based routes
  _layout.tsx           #   Root layout (Stack navigator + ThemeProvider)
  modal.tsx             #   Modal screen
  (tabs)/               #   Tab navigator group
    _layout.tsx          #     Tab bar configuration
    index.tsx            #     Home tab
    explore.tsx          #     Explore tab
components/             # Reusable UI components
  ui/                   #   Generic primitives (no app domain knowledge)
    collapsible.tsx
    icon-symbol.tsx     #     Android/web fallback (MaterialIcons)
    icon-symbol.ios.tsx #     iOS-specific (SF Symbols)
    themed-text.tsx     #     Theme-aware Text wrapper
    themed-view.tsx     #     Theme-aware View wrapper
  layout/               #   App shell / structural components
    haptic-tab.tsx
    parallax-scroll-view.tsx
  navigation/           #   Navigation-related components
    external-link.tsx
constants/              # Shared constants
  theme.ts              #   Colors and Fonts (light/dark mode)
hooks/                  # Custom React hooks
  use-color-scheme.ts       # Native (re-exports RN hook)
  use-color-scheme.web.ts   # Web (hydration-safe variant)
  use-theme-color.ts        # Resolves theme-aware colors
assets/                 # Static images and icons
scripts/                # Utility scripts
```

## Code Style Guidelines

### TypeScript

- **Strict mode** is enabled (`"strict": true` in tsconfig.json).
- Use TypeScript for all source files (`.ts` / `.tsx`). No `.js` source files except config.
- Use `type` imports when importing only types: `import type { PropsWithChildren } from 'react'`.
- Prefer explicit typing for component props; define a `type Props` or `type XxxProps` near the
  component. Extend from React Native base props (e.g., `TextProps & { ... }`).
- Use `@/` path alias for all internal imports (maps to project root).

### Imports

Imports are organized in two groups separated by a blank line:

1. **External packages** (react, react-native, expo-_, @react-navigation/_)
2. **Internal modules** using `@/` alias (@/components/_, @/hooks/_, @/constants/\*)

Within each group, imports are sorted alphabetically. The VS Code settings enforce
`source.organizeImports` and `source.sortMembers` on save.

### Naming Conventions

| Item                      | Convention                  | Example                                          |
| ------------------------- | --------------------------- | ------------------------------------------------ |
| Files (components, hooks) | kebab-case                  | `themed-text.tsx`, `use-color-scheme.ts`         |
| React components          | PascalCase                  | `ThemedText`, `ParallaxScrollView`               |
| Hooks                     | camelCase with `use` prefix | `useColorScheme`, `useThemeColor`                |
| Constants                 | PascalCase for objects      | `Colors`, `Fonts`                                |
| Local variables           | camelCase                   | `colorScheme`, `headerAnimatedStyle`             |
| Types/Interfaces          | PascalCase                  | `ThemedTextProps`, `IconSymbolName`              |
| StyleSheet keys           | camelCase                   | `titleContainer`, `stepContainer`                |
| Platform files            | `name.platform.tsx`         | `icon-symbol.ios.tsx`, `use-color-scheme.web.ts` |

### Component Patterns

- **Default exports** for screen/page components (files in `app/`).
- **Named exports** for reusable components (files in `components/`, `hooks/`).
- Props are destructured in the function signature.
- Use `StyleSheet.create()` for styles; define `const styles` at the bottom of the file
  after the component.
- For theme-aware components, use `useThemeColor()` or `useColorScheme()` hooks. Do not
  hardcode colors -- use `Colors` from `@/constants/theme`.

### Platform-Specific Code

- Use `process.env.EXPO_OS` for platform checks in component logic.
- Use `Platform.select()` for platform-dependent values.
- Use `.ios.tsx` / `.web.ts` file suffixes for platform-specific module implementations
  (Expo/Metro resolves the correct file automatically).

### Formatting

- ESLint with `eslint-config-expo` (flat config, ESLint 9).
- No Prettier config -- rely on ESLint for formatting rules.
- Single quotes for strings (enforced by eslint-config-expo).
- 2-space indentation.
- Trailing commas in multi-line structures.
- JSX closing brackets on the same line as the last prop when multi-line.
- **No decorative comment separators.** Do not add lines like
  `// ---------------------------------------------------------------------------` or
  `// ===== Section =====` to visually divide sections in a file. Use JSDoc comments on
  the declarations themselves to document purpose; the code structure should be
  self-explanatory without ASCII-art dividers.

### Error Handling

- Use optional chaining (`?.`) for nullable callback invocations (e.g., `props.onPressIn?.(ev)`).
- Default `useColorScheme()` to `'light'` with nullish coalescing: `?? 'light'`.
- No try/catch blocks observed in current codebase; when adding them, prefer specific
  error types and user-facing feedback via the UI rather than silent catches.

### Dark Mode / Theming

- All colors are defined in `constants/theme.ts` under `Colors.light` and `Colors.dark`.
- Components use `useThemeColor()` to resolve the correct color for the current scheme.
- `ThemedView` and `ThemedText` accept optional `lightColor` / `darkColor` overrides.
- The root layout wraps the app in `ThemeProvider` from React Navigation.

### Icon System

- Use `IconSymbol` component, which maps SF Symbol names to Material Icons.
- When adding new icons, add the SF Symbol name -> Material Icon name mapping in
  `components/ui/icon-symbol.tsx` in the `MAPPING` constant.
- On iOS, native SF Symbols are rendered via `expo-symbols`.

## Key Dependencies

| Package                        | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `expo-router`                  | File-based routing                    |
| `@react-navigation/*`          | Navigation primitives (tabs, stack)   |
| `react-native-reanimated`      | Animations                            |
| `react-native-gesture-handler` | Gesture handling                      |
| `expo-haptics`                 | Haptic feedback (iOS)                 |
| `expo-image`                   | Optimized image component             |
| `expo-web-browser`             | In-app browser for external links     |
| `expo-symbols`                 | Native SF Symbols (iOS)               |
| `@expo/vector-icons`           | Material Icons fallback (Android/web) |
