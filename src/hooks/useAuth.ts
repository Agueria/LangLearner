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

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Authentication failed.';

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const bootstrap = useCallback(async () => {
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
    isConfigured: isFirebaseConfigured,
    isLoading: auth.status === 'idle' || auth.status === 'loading',
    login,
    logout,
    register,
  };
};
