import { BasicIndex, createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { persistedCollectionOptions } from "@tanstack/expo-db-sqlite-persistence";
import { parseLoadSubsetOptions } from "@tanstack/db";
import type { SimpleComparison, ParsedOrderBy } from "@tanstack/db";

import { api } from "@/api";
import type { EntryQueryParams } from "@/api/types";
import type { EntryListRow } from "@/collections/schemas";
import { getCoverImage } from "@/lib/cover-image";
import { createPersistence } from "@/lib/persistence";
import { queryClient } from "@/lib/query-client";

/** Default page size when the live query doesn't specify a limit. */
const DEFAULT_LIMIT = 50;

/**
 * Map a `SimpleComparison` filter's field path to a recognizable key.
 * E.g. `["feed_id"]` → `"feed_id"`, `["feed", "category", "id"]` → `"feed.category.id"`.
 */
function fieldKey(filter: SimpleComparison): string {
  return filter.field.join(".");
}

/**
 * Map a `ParsedOrderBy` entry's field path to a Miniflux `order` param value.
 * Only a subset of fields are supported by the Miniflux API.
 */
function toMinifluxOrder(sort: ParsedOrderBy): string | undefined {
  const key = sort.field.join(".");
  const mapping: Record<string, string> = {
    published_at: "published_at",
    id: "id",
    status: "status",
    "feed.category.title": "category_title",
    "feed.category.id": "category_id",
  };
  return mapping[key];
}

/**
 * Build Miniflux API query params and determine the correct endpoint from
 * the parsed load subset options that TanStack DB passes via `ctx.meta`.
 */
function buildApiCall(
  filters: SimpleComparison[],
  sorts: ParsedOrderBy[],
  limit?: number,
): {
  endpoint: "entries" | "feed" | "category";
  feedId?: number;
  categoryId?: number;
  params: EntryQueryParams;
} {
  const params: EntryQueryParams = {
    limit: limit ?? DEFAULT_LIMIT,
  };

  let endpoint: "entries" | "feed" | "category" = "entries";
  let feedId: number | undefined;
  let categoryId: number | undefined;

  for (const filter of filters) {
    const key = fieldKey(filter);
    if (filter.operator !== "eq") continue;

    switch (key) {
      case "feed_id":
        endpoint = "feed";
        feedId = filter.value as number;
        break;
      case "feed.category.id":
        endpoint = "category";
        categoryId = filter.value as number;
        break;
      case "status":
        params.status = filter.value as EntryQueryParams["status"];
        break;
      case "starred":
        params.starred = filter.value as boolean;
        break;
    }
  }

  if (sorts.length > 0) {
    const primary = sorts[0]!;
    const order = toMinifluxOrder(primary);
    if (order) {
      params.order = order as EntryQueryParams["order"];
      params.direction = primary.direction;
    }
  }

  return { endpoint, feedId, categoryId, params };
}

/**
 * Strip `content` from a Miniflux entry and derive `cover_image_url`.
 * Returns an `EntryListRow` suitable for the list collection.
 */
function toListRow(entry: Record<string, unknown>): EntryListRow {
  const { content, ...rest } = entry as Record<string, unknown> & {
    content?: string;
  };
  return {
    ...rest,
    cover_image_url: getCoverImage((rest as EntryListRow).enclosures, content),
  } as EntryListRow;
}

/**
 * Entries list collection.
 *
 * Uses `syncMode: "on-demand"` so only entries matching active live queries
 * are loaded from SQLite into memory. The `queryFn` maps TanStack DB's
 * parsed predicates to the appropriate Miniflux API endpoint and params.
 *
 * `content` is stripped from entries to avoid loading large HTML bodies
 * into memory. Use `entryDetailCollection` to fetch full entry content.
 */
const queryOptions = queryCollectionOptions({
  id: "entries",
  queryKey: ["entries"],
  queryClient,
  syncMode: "on-demand",
  getKey: (entry: EntryListRow) => entry.id,
  queryFn: async (ctx): Promise<EntryListRow[]> => {
    const { filters, sorts, limit } = parseLoadSubsetOptions(
      ctx.meta?.loadSubsetOptions,
    );

    const { endpoint, feedId, categoryId, params } = buildApiCall(
      filters,
      sorts,
      limit,
    );

    let res;
    switch (endpoint) {
      case "feed":
        res = await api.getFeedEntries(feedId!, params, ctx.signal);
        break;
      case "category":
        res = await api.getCategoryEntries(categoryId!, params, ctx.signal);
        break;
      default:
        res = await api.getEntries(params, ctx.signal);
        break;
    }

    return res.entries.map(toListRow);
  },
});

const persistedOptions = persistedCollectionOptions({
  ...queryOptions,
  persistence: createPersistence<EntryListRow, number>(),
  schemaVersion: 4,
});

export const entriesCollection = createCollection({
  ...persistedOptions,
  schema: undefined,
  autoIndex: "eager",
  defaultIndexType: BasicIndex,
});
