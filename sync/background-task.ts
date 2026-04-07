import * as BackgroundTask from "expo-background-task";
import { BackgroundTaskResult } from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { incrementalSync } from "@/sync/sync-engine";

const BACKGROUND_SYNC_TASK = "background-sync";

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await incrementalSync();
    return BackgroundTaskResult.Success;
  } catch {
    return BackgroundTaskResult.Failed;
  }
});

/**
 * Register the background sync task. Should be called once during app
 * initialization (after migrations have completed).
 *
 * On iOS, the minimum interval is advisory -- the OS schedules tasks based
 * on usage patterns and battery state. On Android, WorkManager handles
 * scheduling.
 */
export async function registerBackgroundSync(): Promise<void> {
  const status = await BackgroundTask.getStatusAsync();

  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
    return;
  }

  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15,
    });
  }
}
