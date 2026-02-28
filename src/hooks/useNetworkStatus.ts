// Hook for real-time connectivity status.
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

const mapStateToStatus = (state: NetInfoState): NetworkStatus => ({
  isConnected: Boolean(state.isConnected),
  isInternetReachable: Boolean(state.isInternetReachable),
});

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    let isMounted = true;

    const updateStatus = (state: NetInfoState) => {
      if (!isMounted) {
        return;
      }
      setStatus(mapStateToStatus(state));
    };

    // Seed state immediately, then subscribe to real-time changes.
    NetInfo.fetch().then(updateStatus);
    const unsubscribe = NetInfo.addEventListener(updateStatus);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return status;
};
