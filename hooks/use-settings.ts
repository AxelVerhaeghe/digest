import { useMutation, useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { userSettings } from "@/db/schema";
import { invalidateEntries, invalidateSettings } from "@/db/invalidate";

export type StatusFilter = "all" | "unread";

const SETTINGS_KEYS = {
  statusFilter: "status_filter",
} as const;

const DEFAULTS = {
  statusFilter: "all" as StatusFilter,
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
