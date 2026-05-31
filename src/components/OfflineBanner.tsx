// Cihaz offline oldugunda tum ekranlarin ustunde gorunen banner.
// NetInfo ile baglanti takip edilir; opacity animasyonu ile girip cikar.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  // Sadece network'e bagli olmak yetmez; captive portal gibi durumlarda
  // isInternetReachable false olabilir. Bu yuzden iki deger birlikte kontrol edilir.
  const isOffline = !(isConnected && isInternetReachable);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Baglanti degistikce banner fade in/out olur.
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
        // Banner status bar'in altinda kalsin diye safe area top eklenir.
        { paddingTop: insets.top + 8, opacity },
      ]}
    >
      <Text style={styles.text}>{t('offline')}</Text>
    </Animated.View>
  );
}
