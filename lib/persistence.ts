import "react-native-random-uuid";

import { openDatabaseSync } from "expo-sqlite";
import { createExpoSQLitePersistence } from "@tanstack/expo-db-sqlite-persistence";
import type { ExpoSQLiteDatabaseLike } from "@tanstack/expo-db-sqlite-persistence";

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
export const database = openDatabaseSync(
  "digest.db",
) as unknown as ExpoSQLiteDatabaseLike;

/**
 * Create a typed persistence adapter for a specific collection type.
 *
 * Each collection calls this with its own row type so that the returned
 * `PersistedCollectionPersistence<T, TKey>` matches exactly what
 * `persistedCollectionOptions` expects — no casts needed at the
 * collection definition site.
 *
 * Internally the persistence layer serialises everything to JSON, so
 * the `T` generic only exists for type-level compatibility.
 *
 * Expo / React Native are single-process, so no coordinator is required
 * (the default `SingleProcessCoordinator` is used internally).
 */
export function createPersistence<
  T extends object,
  TKey extends string | number = number,
>() {
  return createExpoSQLitePersistence<T, TKey>({ database });
}
