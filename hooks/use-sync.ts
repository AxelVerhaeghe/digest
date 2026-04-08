import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BackfillProgress,
  backfillOlderEntries,
  incrementalSync,
  initialSync,
  needsBackfill,
  needsInitialSync,
} from "@/sync/sync-engine";
import { flushMutationQueue } from "@/sync/mutation-processor";
import { useIsOnline } from "@/hooks/use-connectivity";

type SyncState =
  | { status: "idle" }
  | { status: "initial-sync" }
  | { status: "syncing" }
  | { status: "error"; error: Error }
  | { status: "ready" };

/**
 * Manages the app's sync lifecycle:
 * - Runs initial sync on first launch (quick — fetches ~200 entries)
 * - Runs incremental sync on subsequent launches
 * - Kicks off background backfill when the full history hasn't been fetched
 * - Flushes the mutation queue when connectivity is restored
 * - Exposes sync and backfill status for loading indicators
 */
export function useSync() {
  const [state, setState] = useState<SyncState>({ status: "idle" });
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillProgress, setBackfillProgress] =
    useState<BackfillProgress | null>(null);
  const isOnline = useIsOnline();
  const prevOnline = useRef<boolean | null>(null);
  const backfillController = useRef<AbortController | null>(null);

  const startBackfillIfNeeded = useCallback(async () => {
    if (backfillController.current) return;

    const shouldBackfill = await needsBackfill();
    if (!shouldBackfill) return;

    const controller = new AbortController();
    backfillController.current = controller;
    setIsBackfilling(true);

    try {
      await backfillOlderEntries(controller.signal, (progress) => {
        setBackfillProgress(progress);
      });
    } catch {
      // Backfill failed (network error, abort, etc). Will retry on
      // next launch or connectivity restore.
    } finally {
      backfillController.current = null;
      setIsBackfilling(false);
      setBackfillProgress(null);
    }
  }, []);

  const runSync = useCallback(async () => {
    try {
      const isFirstSync = await needsInitialSync();

      if (isFirstSync) {
        setState({ status: "initial-sync" });
        await initialSync();
      } else {
        setState({ status: "syncing" });
        await incrementalSync();
      }

      setState({ status: "ready" });
      startBackfillIfNeeded();
    } catch (error) {
      if (state.status === "initial-sync") {
        setState({
          status: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      } else {
        setState({ status: "ready" });
      }
    }
  }, [startBackfillIfNeeded]);

  useEffect(() => {
    runSync();

    return () => {
      backfillController.current?.abort();
    };
  }, [runSync]);

  useEffect(() => {
    if (prevOnline.current === false && isOnline === true) {
      flushMutationQueue().catch(() => {});

      if (state.status === "ready") {
        incrementalSync()
          .then(() => startBackfillIfNeeded())
          .catch(() => {});
      }
    }
    prevOnline.current = isOnline;
  }, [isOnline, state.status, startBackfillIfNeeded]);

  return {
    ...state,
    isReady: state.status === "ready",
    isInitialSync: state.status === "initial-sync",
    isSyncing: state.status === "syncing" || state.status === "initial-sync",
    isOnline,
    isBackfilling,
    backfillProgress,
    refresh: runSync,
  };
}
