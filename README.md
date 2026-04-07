# Digest

A local-first RSS reader for iOS and Android. Digest is a mobile-friendly frontend for [Miniflux](https://miniflux.app/) that stores everything locally in SQLite so you can read your feeds offline. Syncing happens in the background when you have a connection.

## Why

Miniflux is great, but its web UI isn't designed for phones. Digest gives you a native mobile experience on top of your self-hosted Miniflux instance, with the added benefit of offline reading. Articles, feeds, and read state are all cached locally -- the app never blocks on the network to show you content.

## How it works

- All data lives in a local SQLite database (via Drizzle ORM + expo-sqlite). The UI always reads from the local DB.
- On first launch, the app syncs your most recent ~1000 entries. After that, incremental syncs pull in only what's changed.
- When you scroll past what's stored locally, older entries are fetched on-demand from Miniflux and cached for next time.
- Mark-as-read, starred, and other mutations are applied locally first (optimistic), queued, and pushed to Miniflux when you're back online.
- Background sync runs periodically so the app stays fresh even if you haven't opened it in a while.

## Prerequisites

You'll need a running [Miniflux](https://miniflux.app/) instance and an API token. Miniflux is self-hosted -- see their docs for setup.

## Getting started

```bash
npm install
npm start
```

Then open the app on your device or simulator. Platform shortcuts:

```bash
npm run ios
npm run android
```

## Project structure

```
app/           File-based routes (Expo Router)
api/           Miniflux API client
db/            SQLite database, Drizzle schema, query invalidation
sync/          Sync engine, offline mutation queue, background tasks
hooks/         React hooks (entries, feeds, categories, sync, etc.)
components/    UI components (article, feed, category, shared primitives)
constants/     Theme colors and fonts
lib/           Utilities (query client, HTML helpers, image extraction)
drizzle/       Generated SQL migrations (committed to git)
```

## Tech stack

- React Native 0.81 / Expo SDK 54 / React 19
- TypeScript (strict mode)
- Drizzle ORM + expo-sqlite for local storage
- TanStack Query for cache and UI reactivity
- Expo Router (file-based routing) + React Navigation v7
- Background sync via expo-background-task

## Development

Lint:

```bash
npm run lint
```

Type-check:

```bash
npx tsc --noEmit
```

After changing the database schema in `db/schema.ts`, generate a new migration:

```bash
npx drizzle-kit generate
```

Commit the generated `.sql` files and `drizzle/meta/` directory.
