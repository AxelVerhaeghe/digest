import "react-native-random-uuid";

import { openDatabaseSync } from "expo-sqlite";
import { createExpoSQLitePersistence } from "@tanstack/expo-db-sqlite-persistence";
import type { ExpoSQLiteDatabaseLike } from "@tanstack/expo-db-sqlite-persistence";
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core";

/**
 * Shared SQLite database used by all TanStack DB collections for local
 * persistence. expo-sqlite opens (or creates) the database file in the
 * app's sandboxed data directory.
 *
 * The cast is needed because expo-sqlite v15's `SQLiteDatabase` class is
 * slightly more restrictive than TanStack's `ExpoSQLiteDatabaseLike` duck
 * type in two places:
 *
 * - `getAllAsync` / `runAsync` have required `params` in their first
 *   overload, while TanStack marks `params` optional.
 * - `withExclusiveTransactionAsync` returns `Promise<void>`, while
 *   TanStack's interface is generic (`Promise<T>`).
 *
 * At runtime the APIs are fully compatible — the persistence layer always
 * passes params and ignores the transaction return value.
 */
const database = openDatabaseSync(
  "digest.db",
) as unknown as ExpoSQLiteDatabaseLike;

/**
 * Enable WAL (Write-Ahead Logging) mode for better concurrent read/write
 * performance. WAL allows readers to proceed without blocking writers and
 * vice-versa, reducing "database is locked" errors.
 */
(database as unknown as { execSync: (sql: string) => void }).execSync(
  "PRAGMA journal_mode = WAL",
);

/**
 * Shared persistence singleton backed by a single `ExpoSQLiteDriver`.
 *
 * A single `createExpoSQLitePersistence` call means all collections share
 * the same driver instance and its internal operation queue. This
 * serialises all database operations (reads, writes, transactions) through
 * one queue, preventing concurrent exclusive transactions from causing
 * "database is locked" errors.
 *
 * Expo / React Native are single-process, so no coordinator is required
 * (the default `SingleProcessCoordinator` is used internally).
 */
const sharedPersistence = createExpoSQLitePersistence({ database });

/**
 * Return the shared persistence adapter, typed for a specific collection.
 *
 * Every call returns the **same** underlying driver and coordinator — the
 * generic parameters only exist for compile-time compatibility with
 * `persistedCollectionOptions`. No new `ExpoSQLiteDriver` is created.
 */
export function createPersistence<
  T extends object,
  TKey extends string | number = number,
>() {
  return sharedPersistence as unknown as PersistedCollectionPersistence<
    T,
    TKey
  >;
}
