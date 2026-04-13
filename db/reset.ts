import { db } from "@/db/database";
import {
  categories,
  entries,
  entryContent,
  feeds,
  icons,
  pendingMutations,
  syncMeta,
  userSettings,
} from "@/db/schema";

/**
 * Wipe all persisted local data so the next login starts from a clean state.
 */
export async function resetLocalData(): Promise<void> {
  await db.delete(entryContent);
  await db.delete(entries);
  await db.delete(feeds);
  await db.delete(categories);
  await db.delete(icons);
  await db.delete(pendingMutations);
  await db.delete(syncMeta);
  await db.delete(userSettings);
}
