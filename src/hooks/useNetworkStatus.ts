// NetInfo wrapper hook'u.
// Uygulama offline banner ve cloud sync icin iki bilgiye bakar:
// cihaz bir network'e bagli mi, ve o network gercekten internete cikabiliyor mu.
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

export const mapStateToStatus = (state: NetInfoState): NetworkStatus => ({
  isConnected: Boolean(state.isConnected),
  // NetInfo ozellikle web/ilk acilis aninda isInternetReachable icin null
  // donebilir. Null "offline" degil "henuz bilinmiyor" anlamina gelir.
  // Bu ayrim onemli: null'i false saysaydik app ilk acilista yanlis offline
  // banner gosterir ve cloud sync gereksiz yere bekleyebilirdi.
  isInternetReachable: state.isInternetReachable !== false,
});

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    let isMounted = true;

    const updateStatus = (state: NetInfoState) => {
      // Async fetch sonucu component kapandiktan sonra gelirse state yazmayalim.
      // Bu guard, testlerde ve hizli route gecislerinde "unmounted component"
      // state update uyarilarini engeller.
      if (!isMounted) {
        return;
      }
      setStatus(mapStateToStatus(state));
    };

    // Ilk degeri hemen cekiyoruz, sonra anlik degisimlere subscribe oluyoruz.
    NetInfo.fetch().then(updateStatus);
    const unsubscribe = NetInfo.addEventListener(updateStatus);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return status;
};
