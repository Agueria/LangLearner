import * as SecureStore from 'expo-secure-store';
import type { AuthSession } from '../constants/types';

const AUTH_SESSION_KEY = 'langlearner.auth.session';

export const saveAuthSession = async (session: AuthSession) => {
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
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    return null;
  }
};

export const clearAuthSession = async () => {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};
