import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { count as sqlCount } from "drizzle-orm";

import { db } from "@/db/database";
import { pendingMutations } from "@/db/schema";
import {
  incrementalSync,
  initialSync,
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
 * - Runs initial sync on first launch
 * - Runs incremental sync on subsequent launches
 * - Flushes the mutation queue when connectivity is restored
 * - Exposes sync status for loading indicators
 */
export function useSync() {
  const [state, setState] = useState<SyncState>({ status: "idle" });
  const isOnline = useIsOnline();
  const prevOnline = useRef<boolean | null>(null);

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
  }, []);

  useEffect(() => {
    runSync();
  }, [runSync]);

  useEffect(() => {
    if (prevOnline.current === false && isOnline === true) {
      flushMutationQueue().catch(() => {});

      if (state.status === "ready") {
        incrementalSync().catch(() => {});
      }
    }
    prevOnline.current = isOnline;
  }, [isOnline, state.status]);

  return {
    ...state,
    isReady: state.status === "ready",
    isInitialSync: state.status === "initial-sync",
    isSyncing: state.status === "syncing" || state.status === "initial-sync",
    isOnline,
    refresh: runSync,
  };
}
