// NetInfo wrapper hook'u.
// Uygulama offline banner ve cloud sync icin iki bilgiye bakar:
// cihaz bir network'e bagli mi, ve o network gercekten internete cikabiliyor mu.
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

type BrowserConnectivityTarget = typeof globalThis & {
  addEventListener?: (type: 'online' | 'offline', listener: () => void) => void;
  navigator?: {
    onLine?: boolean;
  };
  removeEventListener?: (type: 'online' | 'offline', listener: () => void) => void;
};

export const mapStateToStatus = (state: NetInfoState): NetworkStatus => ({
  isConnected: Boolean(state.isConnected),
  // NetInfo ozellikle web/ilk acilis aninda isInternetReachable icin null
  // donebilir. Null "offline" degil "henuz bilinmiyor" anlamina gelir.
  // Bu ayrim onemli: null'i false saysaydik app ilk acilista yanlis offline
  // banner gosterir ve cloud sync gereksiz yere bekleyebilirdi.
  isInternetReachable: state.isInternetReachable !== false,
});

const readBrowserOnlineValue = (
  target: BrowserConnectivityTarget = globalThis as BrowserConnectivityTarget
): boolean | null => {
  const browserOnline = target.navigator?.onLine;

  // React Native cihazlarda navigator.onLine olmayabilir. Bu durumda NetInfo
  // birincil kaynak olarak kalir; sadece web preview gibi tarayici yuzeylerinde
  // ek guvenlik sinyali kullaniriz.
  return typeof browserOnline === 'boolean' ? browserOnline : null;
};

export const applyBrowserOnlineFallback = (
  status: NetworkStatus,
  target: BrowserConnectivityTarget = globalThis as BrowserConnectivityTarget
): NetworkStatus => {
  const browserOnline = readBrowserOnlineValue(target);

  // Playwright/Chrome offline modu gibi web testlerinde NetInfo bazen eski
  // degeri tutabilir. Tarayici "offline" diyorsa bunu kesin sinyal kabul edip
  // hem banner'i hem cloud sync bekletmeyi ayni anda tetikliyoruz.
  if (browserOnline === false) {
    return {
      isConnected: false,
      isInternetReachable: false,
    };
  }

  // Tarayici online ise NetInfo'nun daha ayrintili sinyalini ezmiyoruz.
  // Ornegin captive portal ya da DNS problemi varsa NetInfo false donebilir.
  return status;
};

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
      setStatus(applyBrowserOnlineFallback(mapStateToStatus(state)));
    };

    const updateFromBrowserEvent = () => {
      if (!isMounted) {
        return;
      }

      const browserOnline = readBrowserOnlineValue();

      if (browserOnline === false) {
        // Offline event'i geldiginde NetInfo fetch beklemeden hemen UI'yi
        // offline moda aliyoruz. Boylece banner gecikmeden gorunur.
        setStatus({
          isConnected: false,
          isInternetReachable: false,
        });
        return;
      }

      // Online event'i geldiginde NetInfo'dan son durumu tekrar isteriz.
      // Tarayici online olsa bile internet erisilebilir olmayabilir.
      NetInfo.fetch().then(updateStatus);
    };

    const browserTarget = globalThis as BrowserConnectivityTarget;

    // Ilk degeri hemen cekiyoruz, sonra anlik degisimlere subscribe oluyoruz.
    NetInfo.fetch().then(updateStatus);
    const unsubscribe = NetInfo.addEventListener(updateStatus);
    browserTarget.addEventListener?.('offline', updateFromBrowserEvent);
    browserTarget.addEventListener?.('online', updateFromBrowserEvent);

    return () => {
      isMounted = false;
      unsubscribe();
      browserTarget.removeEventListener?.('offline', updateFromBrowserEvent);
      browserTarget.removeEventListener?.('online', updateFromBrowserEvent);
    };
  }, []);

  return status;
};
