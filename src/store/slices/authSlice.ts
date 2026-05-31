import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../constants/types';

export type AuthStatus =
  | 'authenticated'
  | 'idle'
  | 'loading'
  | 'unauthenticated';

type AuthState = {
  error: string;
  status: AuthStatus;
  user: User | null;
};

const initialState: AuthState = {
  error: '',
  status: 'idle',
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStarted(state) {
      return { ...state, error: '', status: 'loading' };
    },
    authSucceeded(state, action: PayloadAction<User>) {
      return {
        ...state,
        error: '',
        status: 'authenticated',
        user: action.payload,
      };
    },
    authFailed(state, action: PayloadAction<string>) {
      return {
        ...state,
        error: action.payload,
        status: 'unauthenticated',
        user: null,
      };
    },
    authSignedOut(state) {
      return { ...state, error: '', status: 'unauthenticated', user: null };
    },
    clearAuthError(state) {
      return { ...state, error: '' };
    },
  },
});

export const {
  authFailed,
  authSignedOut,
  authStarted,
  authSucceeded,
  clearAuthError,
} = authSlice.actions;
export default authSlice.reducer;
