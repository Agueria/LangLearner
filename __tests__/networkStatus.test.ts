import type { NetInfoState } from '@react-native-community/netinfo';
import { mapStateToStatus } from '../src/hooks/useNetworkStatus';

describe('network status mapping', () => {
  it('treats unknown internet reachability as online when the device is connected', () => {
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
