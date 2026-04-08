import { useMutation, useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { userSettings } from "@/db/schema";
import { invalidateEntries, invalidateSettings } from "@/db/invalidate";

export type StatusFilter = "all" | "unread";
export type SortOrder = "newest" | "oldest";

const SETTINGS_KEYS = {
  statusFilter: "status_filter",
  markAsReadOnScroll: "mark_as_read_on_scroll",
  sortOrder: "sort_order",
} as const;

const DEFAULTS = {
  statusFilter: "all" as StatusFilter,
  markAsReadOnScroll: false,
  sortOrder: "newest" as SortOrder,
} as const;

async function getSetting(key: string): Promise<string | null> {
  const rows = await db
    .select({ value: userSettings.value })
    .from(userSettings)
    .where(eq(userSettings.key, key))
    .limit(1);

  return rows[0]?.value ?? null;
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await db
    .insert(userSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: userSettings.key, set: { value } });
}

export function useStatusFilter() {
  return useQuery({
    queryKey: ["settings", SETTINGS_KEYS.statusFilter],
    queryFn: async (): Promise<StatusFilter> => {
      const value = await getSetting(SETTINGS_KEYS.statusFilter);
      if (value === "unread") return "unread";
      return DEFAULTS.statusFilter;
    },
  });
}

export function useUpdateStatusFilter() {
  return useMutation({
    mutationFn: async (value: StatusFilter) => {
      await upsertSetting(SETTINGS_KEYS.statusFilter, value);
    },
    onSuccess: () => {
      invalidateSettings();
      invalidateEntries();
    },
  });
}

export function useMarkAsReadOnScroll() {
  return useQuery({
    queryKey: ["settings", SETTINGS_KEYS.markAsReadOnScroll],
    queryFn: async (): Promise<boolean> => {
      const value = await getSetting(SETTINGS_KEYS.markAsReadOnScroll);
      return value === "true";
    },
  });
}

export function useUpdateMarkAsReadOnScroll() {
  return useMutation({
    mutationFn: async (value: boolean) => {
      await upsertSetting(SETTINGS_KEYS.markAsReadOnScroll, String(value));
    },
    onSuccess: () => {
      invalidateSettings();
    },
  });
}

export function useSortOrder() {
  return useQuery({
    queryKey: ["settings", SETTINGS_KEYS.sortOrder],
    queryFn: async (): Promise<SortOrder> => {
      const value = await getSetting(SETTINGS_KEYS.sortOrder);
      if (value === "oldest") return "oldest";
      return DEFAULTS.sortOrder;
    },
  });
}

export function useUpdateSortOrder() {
  return useMutation({
    mutationFn: async (value: SortOrder) => {
      await upsertSetting(SETTINGS_KEYS.sortOrder, value);
    },
    onSuccess: () => {
      invalidateSettings();
      invalidateEntries();
    },
  });
}
