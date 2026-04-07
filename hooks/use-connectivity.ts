import { useEffect, useState } from "react";

import * as Network from "expo-network";

/**
 * Hook that tracks network connectivity state.
 *
 * Returns `true` when the device has internet access, `false` when offline,
 * and `null` before the initial check completes.
 */
export function useIsOnline(): boolean | null {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const state = await Network.getNetworkStateAsync();
      if (mounted) {
        setIsOnline(state.isInternetReachable ?? state.isConnected ?? false);
      }
    }

    check();

    const subscription = Network.addNetworkStateListener((state) => {
      if (mounted) {
        setIsOnline(state.isInternetReachable ?? state.isConnected ?? false);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return isOnline;
}
