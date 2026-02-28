// Banner shown when the device is offline.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const OfflineBanner = () => {
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
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#D62828',
    alignItems: 'center',
    paddingBottom: 8,
    zIndex: 999,
    elevation: 999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
