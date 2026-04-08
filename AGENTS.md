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

- **Local-first:** All reads come from the local SQLite database via Drizzle ORM.
  Network requests sync data into the local store; the UI never waits on the network
  for rendering.
- **Hybrid pagination:** Infinite-scroll lists read from local SQLite first. When local
  data runs out, older entries are fetched on-demand from the Miniflux API, stored
  locally, and returned seamlessly. This means the initial sync only needs ~1000
  entries for a fast first launch, while the full history is accessible on scroll.
- **Miniflux is the source of truth for feed management:** Adding/removing feeds,
  categories, and OPML import/export go through the Miniflux API.
- **Read state syncs bidirectionally:** Mark-as-read/unread and starred status are
  written locally first (optimistic), queued in a `pending_mutations` table, then
  pushed to Miniflux when online.
- **Offline mutation queue:** All write operations (mark read, toggle bookmark) are
  stored in SQLite and flushed to the API when connectivity is restored.

### Data Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  UI (React)  │────▶│ TanStack     │────▶│  Drizzle ORM  │
│  Components  │     │ Query hooks  │     │  (expo-sqlite) │
└─────────────┘     └──────┬───────┘     └───────┬───────┘
                           │                     │
                    invalidateQueries()    local SQLite DB
                           │                     │
                    ┌──────┴───────┐     ┌───────┴───────┐
                    │  Sync Engine │────▶│  Miniflux API  │
                    │  (background)│     │  (self-hosted) │
                    └──────────────┘     └───────────────┘
```

- **Drizzle ORM + expo-sqlite:** All local data (entries, feeds, categories, icons,
  entry content, pending mutations, sync metadata) lives in a SQLite database with
  WAL mode enabled.
- **TanStack Query:** Provides cache management and UI reactivity. Hooks use
  `useQuery` / `useInfiniteQuery` to read from SQLite. After any SQLite write,
  `invalidateQueries()` triggers re-renders.
- **Sync engine:** Handles initial sync (up to 1000 entries), incremental sync
  (via `changed_after`), and on-demand fetching of older entries. Runs at app launch,
  on connectivity restore, and periodically via background tasks.
- **Mutation processor:** Flushes the `pending_mutations` queue to the Miniflux API,
  batching status changes and processing bookmark toggles.

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
`after`, `before`, `published_before`, `published_after`, `changed_after`,
`before_entry_id`, `after_entry_id`, `category_id`, `starred`, `search`.

## Build & Run Commands

### Documentation Lookup

- When looking up library/framework documentation, use the Context 7 tool first.
- Prefer Context 7 over generic web search so examples and API references stay current.

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

# Generate Drizzle migration after schema changes
npx drizzle-kit generate

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
app/                        # Expo Router file-based routes
  _layout.tsx               #   Root layout (migrations, sync, providers)
  modal.tsx                 #   Modal screen
  (tabs)/                   #   Tab navigator group
    _layout.tsx             #     Tab bar configuration
    index.tsx               #     Home tab (all entries)
    feeds/
      _layout.tsx           #     Feeds tab layout
      index.tsx             #     Feed list
      [feedId].tsx          #     Single feed entries
  entries/
    [entryId].tsx           #   Article detail screen
api/                        # Miniflux API client (unchanged, no local state)
  config.ts                 #   Environment-based API config
  errors.ts                 #   ApiError class
  index.ts                  #   Singleton client export
  miniflux.ts               #   MinifluxClient class with all endpoints
  request.ts                #   HTTP request helper
  types.ts                  #   API request/response types
db/                         # Local database layer
  database.ts               #   expo-sqlite + drizzle() singleton (WAL mode)
  schema.ts                 #   Drizzle table definitions (7 tables)
  invalidate.ts             #   TanStack Query invalidation helpers
drizzle/                    # Generated migrations (committed to VCS)
  migrations.js             #   Migration index (imports .sql files)
  0000_foamy_wind_dancer.sql #  Initial migration
  meta/                     #   Drizzle Kit metadata
sync/                       # Sync and offline mutation system
  sync-engine.ts            #   Initial, incremental, and on-demand sync
  mutation-processor.ts     #   Offline mutation queue flush
  background-task.ts        #   expo-background-task registration
hooks/                      # Custom React hooks
  use-entries.ts            #   Entry list hooks (hybrid local/remote pagination)
  use-feeds.ts              #   Feed queries (useQuery + Drizzle)
  use-categories.ts         #   Category queries
  use-unread-counts.ts      #   Local SQL unread counts
  use-refresh-entries.ts    #   Pull-to-refresh (incremental sync)
  use-sync.ts               #   Sync lifecycle management
  use-connectivity.ts       #   Network state (expo-network)
  use-color-scheme.ts       #   Native (re-exports RN hook)
  use-color-scheme.web.ts   #   Web (hydration-safe variant)
  use-theme-color.ts        #   Resolves theme-aware colors
lib/                        # Shared utilities
  query-client.ts           #   TanStack Query client singleton
  article-html.ts           #   HTML rendering helpers
  cover-image.ts            #   Cover image extraction from enclosures/content
components/                 # Reusable UI components
  article/                  #   Article detail components
    article-header.tsx
    article-hero.tsx
  feed/                     #   Feed list components
    entry-list.tsx          #     Infinite-scroll entry list (FlatList)
    feed-card.tsx           #     Entry card in feed lists
  category/                 #   Category components
    all-articles-link.tsx
  ui/                       #   Generic primitives
    badge.tsx
    collapsible.tsx
    cover-image.tsx
    dot-separator.tsx
    feed-icon.tsx
    icon-button.tsx
    icon-symbol.tsx         #     Android/web fallback (MaterialIcons)
    icon-symbol.ios.tsx     #     iOS-specific (SF Symbols)
    skeleton.tsx
    themed-text.tsx
    themed-view.tsx
  layout/                   #   App shell / structural components
    haptic-tab.tsx
    parallax-scroll-view.tsx
  navigation/               #   Navigation-related components
    external-link.tsx
constants/                  # Shared constants
  theme.ts                  #   Colors and Fonts (light/dark mode)
assets/                     # Static images and icons
scripts/                    # Utility scripts
```

### Database Schema

Seven tables in `db/schema.ts`:

| Table               | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `categories`        | Feed categories synced from Miniflux               |
| `icons`             | Feed favicons (base64 data + mime type)            |
| `feeds`             | Subscribed feeds with FK to categories and icons   |
| `entries`           | Article metadata (no content), FK to feeds         |
| `entry_content`     | Full HTML content, fetched lazily, FK to entries   |
| `pending_mutations` | Offline mutation queue (status changes, bookmarks) |
| `sync_meta`         | Key-value store (last_sync_at, oldest_synced_at)   |

Entries store metadata only. HTML content is in a separate `entry_content` table,
loaded lazily when an article is opened (from local cache or API fallback).

### Sync Strategy

1. **Initial sync** (first launch): Fetches categories, feeds, icons, and the 1000
   most recent entries. Stores `last_sync_at` and `oldest_synced_at` in `sync_meta`.
2. **Incremental sync** (subsequent launches, background): Fetches entries changed
   since `last_sync_at` using the `changed_after` API param. Also refreshes feeds
   and categories.
3. **On-demand older entries** (scroll past local cache): When an infinite-scroll list
   runs out of local data, `fetchOlderEntries()` fetches a batch from the API using
   `published_before`, stores them locally, and updates `oldest_synced_at`.
4. **Mutation flush**: Pending local mutations are pushed to the API on connectivity
   restore and after incremental sync.
5. **Background sync**: Registered via `expo-background-task`, runs incremental sync
   periodically (minimum interval: 15 minutes).

### Drizzle Migrations

Migrations use the idiomatic Drizzle + Expo approach:

1. Edit `db/schema.ts`
2. Run `npx drizzle-kit generate` to produce a new `.sql` file in `drizzle/`
3. The `babel-plugin-inline-import` inlines `.sql` file contents at build time
4. `useMigrations(db, migrations)` applies unapplied migrations on app startup
5. Commit the generated `.sql` files and `drizzle/meta/` to version control

The `babel.config.js` uses ESM `export default` syntax (required because
`package.json` has `"type": "module"`), and `metro.config.js` adds `"sql"` to
`config.resolver.sourceExts` so Metro can resolve `.sql` imports.

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

1. **External packages** (react, react-native, expo-\*, @react-navigation/\*)
2. **Internal modules** using `@/` alias (@/components/\*, @/hooks/\*, @/constants/\*)

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

### Memoization

- **React Compiler is enabled.** It auto-memoizes components and values, so do not use
  `useMemo`, `useCallback`, or `React.memo` for performance. The compiler handles it.
- Only use `useMemo` when a stable reference is required as a dependency for another
  hook's dependency array (e.g., constructing an object passed to a `useEffect` dep list).
  This is rare -- prefer plain variables and let the compiler optimize.

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

| Package                        | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `drizzle-orm`                  | Type-safe ORM for local SQLite             |
| `expo-sqlite`                  | Native SQLite driver                       |
| `@tanstack/react-query`        | Cache management, UI reactivity            |
| `expo-router`                  | File-based routing                         |
| `@react-navigation/*`          | Navigation primitives (tabs, stack)        |
| `expo-network`                 | Connectivity detection                     |
| `expo-background-task`         | Background sync scheduling                 |
| `expo-task-manager`            | Background task definition                 |
| `react-native-reanimated`      | Animations                                 |
| `react-native-gesture-handler` | Gesture handling                           |
| `expo-haptics`                 | Haptic feedback (iOS)                      |
| `expo-image`                   | Optimized image component                  |
| `expo-web-browser`             | In-app browser for external links          |
| `expo-symbols`                 | Native SF Symbols (iOS)                    |
| `@expo/vector-icons`           | Material Icons fallback (Android/web)      |
| `babel-plugin-inline-import`   | Inlines .sql migration files at build time |
| `drizzle-kit`                  | Migration generation (dev dependency)      |
