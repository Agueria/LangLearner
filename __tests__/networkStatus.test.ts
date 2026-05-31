import type { NetInfoState } from '@react-native-community/netinfo';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  applyBrowserOnlineFallback,
  mapStateToStatus,
  useNetworkStatus,
} from '../src/hooks/useNetworkStatus';

const mockFetch = jest.fn();
const mockAddEventListener = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
  default: {
    addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
    fetch: (...args: unknown[]) => mockFetch(...args),
  },
  fetch: (...args: unknown[]) => mockFetch(...args),
}));

const onlineState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
} as NetInfoState;

const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'navigator'
);
const originalAddEventListenerDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'addEventListener'
);
const originalRemoveEventListenerDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'removeEventListener'
);

const setNavigatorOnline = (onLine: boolean) => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { onLine },
  });
};

const restoreGlobalDescriptor = (
  propertyName: 'addEventListener' | 'navigator' | 'removeEventListener',
  descriptor: PropertyDescriptor | undefined
) => {
  if (descriptor) {
    Object.defineProperty(globalThis, propertyName, descriptor);
    return;
  }

  delete (globalThis as Record<string, unknown>)[propertyName];
};

describe('network status mapping', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(onlineState);
    mockAddEventListener.mockReturnValue(jest.fn());
    setNavigatorOnline(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    restoreGlobalDescriptor('navigator', originalNavigatorDescriptor);
    restoreGlobalDescriptor('addEventListener', originalAddEventListenerDescriptor);
    restoreGlobalDescriptor(
      'removeEventListener',
      originalRemoveEventListenerDescriptor
    );
  });

  it('treats unknown internet reachability as online when the device is connected', () => {
    // NetInfo web/ilk acilis aninda isInternetReachable=null dondurebilir.
    // Bunu false saysaydik uygulama yanlislikla "offline" banner gosterirdi.
    expect(
      mapStateToStatus({
        isConnected: true,
        isInternetReachable: null,
        type: 'wifi',
      } as NetInfoState)
    ).toEqual({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  it('preserves explicit offline reachability', () => {
    // Gercek false degeri yine offline kabul edilmeli. Yani fix sadece null
    // belirsizligini yumusatir, gercek offline sinyalini yutmaz.
    expect(
      mapStateToStatus({
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
      } as NetInfoState)
    ).toEqual({
      isConnected: true,
      isInternetReachable: false,
    });
  });

  it('updates the hook immediately when the browser offline event fires', async () => {
    const listeners: Partial<Record<'offline' | 'online', () => void>> = {};

    Object.defineProperty(globalThis, 'addEventListener', {
      configurable: true,
      value: jest.fn((eventName: 'offline' | 'online', listener: () => void) => {
        listeners[eventName] = listener;
      }),
    });
    Object.defineProperty(globalThis, 'removeEventListener', {
      configurable: true,
      value: jest.fn(),
    });

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current).toEqual({
        isConnected: true,
        isInternetReachable: true,
      });
    });

    setNavigatorOnline(false);

    await act(async () => {
      listeners.offline?.();
    });

    expect(result.current).toEqual({
      isConnected: false,
      isInternetReachable: false,
    });
  });

  it('unsubscribes from NetInfo and browser events on unmount', () => {
    const unsubscribe = jest.fn();
    const addBrowserListener = jest.fn();
    const removeBrowserListener = jest.fn();

    mockAddEventListener.mockReturnValue(unsubscribe);
    Object.defineProperty(globalThis, 'addEventListener', {
      configurable: true,
      value: addBrowserListener,
    });
    Object.defineProperty(globalThis, 'removeEventListener', {
      configurable: true,
      value: removeBrowserListener,
    });

    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    // Hook kapanirken hem NetInfo subscription'i hem de web fallback event
    // listener'lari temizlenir; aksi halde route degisimlerinde eski listener
    // state yazmaya devam edebilirdi.
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(removeBrowserListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
    expect(removeBrowserListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
  });

  it('forces offline when the browser navigator reports offline', () => {
    // Web preview ve Playwright offline modu bazen NetInfo event'ini gec
    // iletebiliyor. navigator.onLine=false geldiyse banner'in hemen cikmasi
    // icin bu sinyali kesin offline kabul ediyoruz.
    expect(
      applyBrowserOnlineFallback(
        {
          isConnected: true,
          isInternetReachable: true,
        },
        {
          navigator: {
            onLine: false,
          },
        } as typeof globalThis
      )
    ).toEqual({
      isConnected: false,
      isInternetReachable: false,
    });
  });

  it('does not hide an explicit NetInfo offline state when the browser is online', () => {
    // Tarayici online olsa bile NetInfo daha ayrintili bir problem yakalamis
    // olabilir. Bu nedenle online fallback sadece false alarmi engeller;
    // NetInfo'nun gercek offline sinyalini ezmez.
    expect(
      applyBrowserOnlineFallback(
        {
          isConnected: true,
          isInternetReachable: false,
        },
        {
          navigator: {
            onLine: true,
          },
        } as typeof globalThis
      )
    ).toEqual({
      isConnected: true,
      isInternetReachable: false,
    });
  });
});
