// Banner shown when the device is offline.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    elevation: 999,
    left: 0,
    paddingBottom: 8,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999,
  },
  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOffline = !(isConnected && isInternetReachable);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Fade in/out as connectivity changes.
    Animated.timing(opacity, {
      toValue: isOffline ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOffline, opacity]);

  return (
    <Animated.View
      pointerEvents={isOffline ? 'auto' : 'none'}
      style={[
        styles.banner,
        // Keep the banner below the status bar.
        { paddingTop: insets.top + 8, opacity },
      ]}
    >
      <Text style={styles.text}>You are offline</Text>
    </Animated.View>
  );
}
