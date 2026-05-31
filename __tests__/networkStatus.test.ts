import type { NetInfoState } from '@react-native-community/netinfo';
import { mapStateToStatus } from '../src/hooks/useNetworkStatus';

describe('network status mapping', () => {
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
});
