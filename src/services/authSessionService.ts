import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthSession } from '../constants/types';

// Auth session AsyncStorage'da degil SecureStore'da tutulur.
// Sunumda bunu "token gibi hassas veri native guvenli depoda saklaniyor" diye
// anlatabilirsin.
const AUTH_SESSION_KEY = 'langlearner.auth.session';

const getWebStorage = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage;

export const saveAuthSession = async (session: AuthSession) => {
  // SecureStore string saklar, bu yuzden session JSON'a cevrilir.
  const serializedSession = JSON.stringify(session);
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(AUTH_SESSION_KEY, serializedSession);
    return;
  }

  await SecureStore.setItemAsync(AUTH_SESSION_KEY, serializedSession);
};

export const loadAuthSession = async (): Promise<AuthSession | null> => {
  const webStorage = getWebStorage();
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
    webStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};
