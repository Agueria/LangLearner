import * as SecureStore from 'expo-secure-store';
import type { AuthSession } from '../constants/types';

// Auth session AsyncStorage'da degil SecureStore'da tutulur.
// Sunumda bunu "token gibi hassas veri native guvenli depoda saklaniyor" diye
// anlatabilirsin.
const AUTH_SESSION_KEY = 'langlearner.auth.session';

export const saveAuthSession = async (session: AuthSession) => {
  // SecureStore string saklar, bu yuzden session JSON'a cevrilir.
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const loadAuthSession = async (): Promise<AuthSession | null> => {
  const rawSession = await SecureStore.getItemAsync(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    // Bozuk/corrupt JSON kalirsa session temizlenir ve kullanici tekrar login'e
    // yonlendirilir. Bu, uygulamanin acilista crash olmasini engeller.
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    return null;
  }
};

export const clearAuthSession = async () => {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};
