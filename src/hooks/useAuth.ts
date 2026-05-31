import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isFirebaseConfigured } from '../constants/config';
import {
  getValidAuthSession,
  registerWithEmail,
  signInWithEmail,
  signOut,
} from '../services/firebaseAuthService';
import {
  authFailed,
  authSignedOut,
  authStarted,
  authSucceeded,
  clearAuthError,
} from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';

type Credentials = {
  email: string;
  password: string;
};

// Servis katmanindan gelen unknown hatalari UI'nin gosterebilecegi sade bir
// string'e ceviriyoruz. Boylece ekranlar try/catch detayi bilmek zorunda kalmaz.
const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Authentication failed.';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const bootstrap = useCallback(async () => {
    // Uygulama acilisinda SecureStore'da gecerli session var mi diye bakar.
    // Varsa kullaniciyi direkt tab ekranlarina alir, yoksa login'e yonlendirir.
    dispatch(authStarted());
    try {
      const session = await getValidAuthSession();

      if (!session) {
        dispatch(authSignedOut());
        return;
      }

      dispatch(authSucceeded(session.user));
    } catch (error) {
      dispatch(authFailed(toMessage(error)));
    }
  }, [dispatch]);

  const login = useCallback(
    async (credentials: Credentials) => {
      // Email/password Firebase REST endpoint'ine gider. Basarili olursa
      // session SecureStore'a yazilir ve Redux'a sadece user bilgisi gelir.
      dispatch(authStarted());
      try {
        const session = await signInWithEmail(credentials);
        dispatch(authSucceeded(session.user));
      } catch (error) {
        dispatch(authFailed(toMessage(error)));
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (credentials: Credentials) => {
      // Register akisi login ile ayni session tipini uretir. Bu sayede hesap
      // olusturan kullanici ayrica login olmak zorunda kalmaz.
      dispatch(authStarted());
      try {
        const session = await registerWithEmail(credentials);
        dispatch(authSucceeded(session.user));
      } catch (error) {
        dispatch(authFailed(toMessage(error)));
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    // Cikis iki asamali: once SecureStore session temizlenir, sonra Redux
    // auth state unauthenticated yapilir.
    dispatch(authStarted());
    await signOut();
    dispatch(authSignedOut());
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    ...auth,
    bootstrap,
    dismissError,
    // Firebase env yoksa auth ekranlari butonu kapatir ve acik mesaj gosterir.
    isConfigured: isFirebaseConfigured,
    isLoading: auth.status === 'idle' || auth.status === 'loading',
    login,
    logout,
    register,
  };
};
