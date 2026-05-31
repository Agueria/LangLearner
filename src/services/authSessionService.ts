import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthSession } from '../constants/types';

// Auth session AsyncStorage'da degil SecureStore'da tutulur.
// Sunumda bunu "token gibi hassas veri native guvenli depoda saklaniyor" diye
// anlatabilirsin.
const AUTH_SESSION_KEY = 'langlearner.auth.session';

const getWebStorage = () =>
  // Expo SecureStore native platformlarda guvenli token saklama icin dogru
  // tercih, fakat web bundle'da her method desteklenmeyebiliyor. Screenshot ve
  // web export akislari crash etmesin diye web'de localStorage fallback'i var.
  // Mobilde bu branch'e girilmez; tokenlar yine SecureStore'da kalir.
  Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage;

export const saveAuthSession = async (session: AuthSession) => {
  // SecureStore string saklar, bu yuzden session JSON'a cevrilir.
  const serializedSession = JSON.stringify(session);
  const webStorage = getWebStorage();
  if (webStorage) {
    // Web fallback yalnizca web preview/screenshot icindir. Native guvenlik
    // modelini zayiflatmaz cunku iOS/Android bu path'i kullanmaz.
    webStorage.setItem(AUTH_SESSION_KEY, serializedSession);
    return;
  }

  await SecureStore.setItemAsync(AUTH_SESSION_KEY, serializedSession);
};

export const loadAuthSession = async (): Promise<AuthSession | null> => {
  const webStorage = getWebStorage();
  // Tek fonksiyon hem native hem web storage kaynagini okur. Boylece useAuth
  // hangi platformda oldugunu bilmeden session bootstrap edebilir.
  const rawSession = webStorage
    ? webStorage.getItem(AUTH_SESSION_KEY)
    : await SecureStore.getItemAsync(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    // Bozuk/corrupt JSON kalirsa session temizlenir ve kullanici tekrar login'e
    // yonlendirilir. Bu, uygulamanin acilista crash olmasini engeller.
    if (webStorage) {
      // Corrupt web kaydi da temizlenir; aksi halde her refresh'te ayni parse
      // hatasi tekrar eder ve auth gate surekli hata durumunda kalabilir.
      webStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    }
    return null;
  }
};

export const clearAuthSession = async () => {
  const webStorage = getWebStorage();
  if (webStorage) {
    // Logout her platformda ayni public fonksiyonu cagirir. Web ise
    // localStorage kaydini, native ise SecureStore kaydini temizler.
    webStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};
