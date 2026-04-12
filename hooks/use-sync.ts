import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import {
  type BackfillProgress,
  backfillOlderEntries,
  hasLocalEntries,
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

const FOREGROUND_SYNC_THROTTLE_MS = 5 * 60 * 1000;

type BackfillState = {
  isBackfilling: boolean;
  backfillProgress: BackfillProgress | null;
  startBackfillIfNeeded: () => Promise<void>;
  abortBackfill: () => void;
};

function useBackfillState(): BackfillState {
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillProgress, setBackfillProgress] =
    useState<BackfillProgress | null>(null);
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

  const abortBackfill = useCallback(() => {
    backfillController.current?.abort();
  }, []);

  return {
    isBackfilling,
    backfillProgress,
    startBackfillIfNeeded,
    abortBackfill,
  };
}

type AutoIncrementalSyncOptions = {
  isOnline: boolean | null;
  isReady: boolean;
  runIncrementalSync: () => Promise<void>;
};

function useAutoIncrementalSync({
  isOnline,
  isReady,
  runIncrementalSync,
}: AutoIncrementalSyncOptions): void {
  const prevOnline = useRef<boolean | null>(null);
  const lastForegroundSyncAt = useRef(0);

  useEffect(() => {
    if (prevOnline.current === false && isOnline === true) {
      flushMutationQueue().catch(() => {});

      if (isReady) {
        runIncrementalSync().catch(() => {
          // Best effort; next connectivity/foreground event will retry.
        });
      }
    }

    prevOnline.current = isOnline;
  }, [isOnline, isReady, runIncrementalSync]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") return;
      if (!isReady) return;
      if (isOnline !== true) return;

      const now = Date.now();
      if (now - lastForegroundSyncAt.current < FOREGROUND_SYNC_THROTTLE_MS) {
        return;
      }

      lastForegroundSyncAt.current = now;
      runIncrementalSync().catch(() => {
        // Best effort; next resume will retry.
      });
    });

    return () => {
      subscription.remove();
    };
  }, [isOnline, isReady, runIncrementalSync]);
}

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
  const isOnline = useIsOnline();
  const {
    isBackfilling,
    backfillProgress,
    startBackfillIfNeeded,
    abortBackfill,
  } = useBackfillState();
  const incrementalSyncInFlight = useRef(false);

  const runIncrementalSync = useCallback(async () => {
    if (incrementalSyncInFlight.current) return;

    incrementalSyncInFlight.current = true;
    try {
      await incrementalSync();
      startBackfillIfNeeded().catch(() => {
        // Best effort; next connectivity/foreground event will retry.
      });
    } finally {
      incrementalSyncInFlight.current = false;
    }
  }, [startBackfillIfNeeded]);

  const runSync = useCallback(async () => {
    const isFirstSync = await needsInitialSync();
    const shouldBlockInitialSync = isFirstSync && !(await hasLocalEntries());

    try {
      if (isFirstSync) {
        setState({
          status: shouldBlockInitialSync ? "initial-sync" : "syncing",
        });
        await initialSync();
      } else {
        setState({ status: "syncing" });
        await incrementalSync();
      }

      setState({ status: "ready" });
      startBackfillIfNeeded().catch(() => {
        // Best effort; next connectivity/foreground event will retry.
      });
    } catch (error) {
      if (shouldBlockInitialSync) {
        setState({
          status: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      } else {
        setState({ status: "ready" });
      }
    }
  }, [startBackfillIfNeeded]);

  useAutoIncrementalSync({
    isOnline,
    isReady: state.status === "ready",
    runIncrementalSync,
  });

  useEffect(() => {
    runSync();

    return () => {
      abortBackfill();
    };
  }, [abortBackfill, runSync]);

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
