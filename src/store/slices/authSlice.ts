import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../constants/types';

// AuthStatus, ekrandaki login akisini okunur hale getirir.
// "idle" ilk acilis, "loading" session kontrolu veya login/register istegi,
// "authenticated" basarili giris, "unauthenticated" cikis veya hata demektir.
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
    // Her auth isteginden once eski hata temizlenir ve UI loading durumuna
    // gecer. Login/register butonlari bu state ile disable edilir.
    authStarted(state) {
      return { ...state, error: '', status: 'loading' };
    },
    // Firebase basarili cevap verince kullanicinin public profil bilgisi
    // Redux'a yazilir. Token burada tutulmaz.
    authSucceeded(state, action: PayloadAction<User>) {
      return {
        ...state,
        error: '',
        status: 'authenticated',
        user: action.payload,
      };
    },
    // Hatalarda mesaj Redux'a yazilir ki login/register ekranlari ayni
    // user-friendly mesaji gosterebilsin.
    authFailed(state, action: PayloadAction<string>) {
      return {
        ...state,
        error: action.payload,
        status: 'unauthenticated',
        user: null,
      };
    },
    // Cikis yapinca kullanici bilgisi temizlenir. SecureStore temizligi
    // servis katmaninda yapilir, burada sadece UI state resetlenir.
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
