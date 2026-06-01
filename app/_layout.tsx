// Uygulamanin en dis katmani burasidir.
// Sunumda burayi "butun ekranlari saran altyapi dosyasi" diye anlatabilirsin:
// Redux store, kalici state, hata yakalama, gesture altyapisi, auth kontrolu,
// offline banner ve cloud sync burada tek bir kok yapida birlestirilir.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthGate, ErrorBoundary, OfflineBanner } from '../src/components';
import { CloudSyncController } from '../src/components/CloudSyncController';
import { useThemeColors } from '../src/hooks';
import '../src/localization/i18n';
import { persistor, store, type RootState } from '../src/store/store';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

function AppShell() {
  const colors = useThemeColors();
  const theme = useSelector((state: RootState) => state.settings.theme);

  return (
    /* ErrorBoundary beklenmeyen render/runtime hatalarinda beyaz ekran
       yerine kullaniciya "Try Again" ekrani gosterir. */
    <ErrorBoundary>
      {/* GestureHandlerRootView, swipe ve pan gesture'lari icin gerekli
          kok container'dir. Quiz swipe ve deck swipe-to-delete bunun
          altinda calisir. */}
      <GestureHandlerRootView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* StatusBar native telefon durum cubugudur. Tema degistiginde sadece
            ekran icerigini degil, saat/pil ikonlarinin kontrastini da
            degistiriyoruz; aksi halde dark mode'da header/tab alani light
            kalmis gibi gorunur. */}
        <StatusBar
          style={theme === 'dark' ? 'light' : 'dark'}
          backgroundColor={colors.background}
        />
        {/* AuthGate login/register harici ekranlara girisi korur.
            Kullanici login degilse tab ekranlari acilmaz. */}
        <AuthGate>
          {/* CloudSyncController gorsel UI cizmez. Sadece auth + network
              durumuna bakip gerekiyorsa Firestore sync tetikler. */}
          <CloudSyncController />
          {/* Slot, Expo Router'in aktif route ekranini buraya yerlestirir. */}
          <Slot />
        </AuthGate>
        {/* OfflineBanner'i Slot'tan sonra render ediyoruz ki tab/header
            katmanlari ustunde kalsin. Aksi halde web preview'da banner
            DOM'da var olsa bile navigation header altinda gizlenebiliyor. */}
        <OfflineBanner />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    // Provider, Redux store'u tum ekranlara acar. Bu sayede deck, card,
    // auth, settings ve sync state'lerine her ekrandan custom hooklarla
    // ulasilabilir.
    <Provider store={store}>
      {/* PersistGate, AsyncStorage'dan gelen Redux state yuklenmeden UI'yi
          baslatmaz. Boylece uygulama acilir acilmaz eski deck/kartlarin
          bir an bos gorunup sonra gelmesi engellenir. */}
      <PersistGate
        persistor={persistor}
        loading={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <AppShell />
      </PersistGate>
    </Provider>
  );
}
