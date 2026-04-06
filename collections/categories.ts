import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { persistedCollectionOptions } from "@tanstack/expo-db-sqlite-persistence";

import { api } from "@/api";
import { queryClient } from "@/lib/query-client";
import { createPersistence } from "@/lib/persistence";
import type { CategoryRow } from "@/collections/schemas";

/**
 * Categories collection.
 *
 * Syncs with Miniflux `GET /v1/categories` and persists locally in SQLite.
 * Categories are managed server-side -- the local collection is read-only
 * for now (no onInsert/onUpdate/onDelete handlers).
 */
const queryOptions = queryCollectionOptions({
  id: "categories",
  queryKey: ["categories"],
  queryClient,
  getKey: (category: CategoryRow) => category.id,
  queryFn: async ({ signal }): Promise<CategoryRow[]> => {
    return api.getCategories(true, signal);
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<CategoryRow, number>(),
  schemaVersion: 1,
});

export const categoriesCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
});
