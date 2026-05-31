import {
  FIREBASE_API_KEY,
  isFirebaseConfigured,
} from '../constants/config';
import type { AuthSession, AuthTokens, User } from '../constants/types';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from './authSessionService';

type FirebaseAuthResponse = {
  displayName?: string;
  email: string;
  expiresIn: string;
  idToken: string;
  localId: string;
  refreshToken: string;
};

type FirebaseRefreshResponse = {
  expires_in: string;
  id_token: string;
  refresh_token: string;
  user_id: string;
};

type FirebaseErrorResponse = {
  error?: {
    message?: string;
  };
};

type Credentials = {
  email: string;
  password: string;
};

// Firebase Auth burada SDK yerine REST API ile kullaniliyor.
// Bunun avantajlari:
// - Expo icinde ek native Firebase kurulumuna gerek kalmaz.
// - Testlerde fetch mocklamak kolay olur.
// - Auth session'i bizim SecureStore servisimizle acik sekilde yonetilir.
const AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_BASE_URL = 'https://securetoken.googleapis.com/v1';
// Token bitmeden 1 dakika once refresh ederek istegin ortasinda token
// expire olma riskini azaltiyoruz.
const EXPIRY_SAFETY_WINDOW_MS = 60 * 1000;

const mapAuthCode = (code: string) => {
  // Firebase hata kodlari teknik ve Ingilizce gelir. Burada bunlari kullanicinin
  // anlayacagi kisa mesajlara ceviriyoruz.
  if (code.includes('EMAIL_EXISTS')) {
    return 'This email is already registered.';
  }
  if (code.includes('EMAIL_NOT_FOUND') || code.includes('INVALID_PASSWORD')) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('INVALID_EMAIL')) {
    return 'Enter a valid email address.';
  }
  if (code.includes('WEAK_PASSWORD')) {
    return 'Password should be at least 6 characters.';
  }
  if (code.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
    return 'Too many attempts. Please try again later.';
  }
  if (code.includes('TOKEN_EXPIRED') || code.includes('INVALID_REFRESH_TOKEN')) {
    return 'Your session expired. Please sign in again.';
  }

  return 'Authentication failed. Please try again.';
};

export const mapFirebaseAuthError = async (response: Response) => {
  try {
    // Firebase hata cevabi JSON formatindadir. Parse edilemezse generic hata
    // donulur, boylece UI ham server cevabi gostermez.
    const body = (await response.json()) as FirebaseErrorResponse;
    return mapAuthCode(body.error?.message ?? '');
  } catch {
    return 'Authentication failed. Please try again.';
  }
};

const assertFirebaseConfigured = () => {
  // Auth ve Firestore kodu repo icinde hazir, ancak gercek Firebase projesi
  // kullanicidan env ister. Env yoksa istek atmadan acik hata veriyoruz.
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_API_KEY and EXPO_PUBLIC_FIREBASE_PROJECT_ID to .env.'
    );
  }
};

const toTokens = ({
  expiresIn,
  idToken,
  refreshToken,
}: FirebaseAuthResponse): AuthTokens => ({
  // Firebase expiresIn saniye verir. Biz Date.now tabanli absolute timestamp
  // sakliyoruz ki daha sonra kolayca "hala gecerli mi" diye kontrol edelim.
  expiresAt: Date.now() + Number(expiresIn) * 1000,
  idToken,
  refreshToken,
});

const toSession = (response: FirebaseAuthResponse): AuthSession => ({
  tokens: toTokens(response),
  user: {
    displayName: response.displayName,
    email: response.email,
    id: response.localId,
  },
});

const requestAuth = async (
  path: 'accounts:signInWithPassword' | 'accounts:signUp',
  credentials: Credentials
) => {
  assertFirebaseConfigured();

  // signUp ve signIn endpoint'leri ayni body yapisini kullanir.
  // path parametresi sadece hangi endpoint'e gidecegimizi belirler.
  const response = await fetch(`${AUTH_BASE_URL}/${path}?key=${FIREBASE_API_KEY}`, {
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
      returnSecureToken: true,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await mapFirebaseAuthError(response));
  }

  const session = toSession((await response.json()) as FirebaseAuthResponse);
  // Basarili auth sonrasi session SecureStore'a yazilir. AsyncStorage yerine
  // SecureStore secilmesinin nedeni token gibi hassas veriyi native guvenli
  // depoda tutmaktir.
  await saveAuthSession(session);
  return session;
};

export const registerWithEmail = (credentials: Credentials) =>
  requestAuth('accounts:signUp', credentials);

export const signInWithEmail = (credentials: Credentials) =>
  requestAuth('accounts:signInWithPassword', credentials);

export const refreshAuthSession = async (
  session: AuthSession
): Promise<AuthSession> => {
  assertFirebaseConfigured();

  // idToken kisa omurludur, refreshToken ile yenilenir. Bu akisi kullanmazsak
  // uygulama bir sure acik kalinca Firestore istekleri 401 almaya baslar.
  const response = await fetch(`${TOKEN_BASE_URL}/token?key=${FIREBASE_API_KEY}`, {
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.tokens.refreshToken,
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!response.ok) {
    // Refresh token artik gecersizse local session'i temizleriz. Aksi halde
    // uygulama surekli bozuk token ile tekrar denemeye devam eder.
    await clearAuthSession();
    throw new Error(await mapFirebaseAuthError(response));
  }

  const data = (await response.json()) as FirebaseRefreshResponse;
  const refreshedSession: AuthSession = {
    tokens: {
      expiresAt: Date.now() + Number(data.expires_in) * 1000,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
    },
    user: {
      ...session.user,
      id: data.user_id,
    },
  };

  await saveAuthSession(refreshedSession);
  return refreshedSession;
};

export const getValidAuthSession = async (): Promise<AuthSession | null> => {
  // Tum cloud servisleri bu fonksiyonu kullanir. Boylece her caller token
  // expiry/refresh detaylarini tekrar yazmak zorunda kalmaz.
  const session = await loadAuthSession();

  if (!session) {
    return null;
  }

  if (session.tokens.expiresAt - EXPIRY_SAFETY_WINDOW_MS > Date.now()) {
    return session;
  }

  return refreshAuthSession(session);
};

export const signOut = async () => {
  await clearAuthSession();
};

export const getCurrentIdToken = async () => {
  const session = await getValidAuthSession();
  return session?.tokens.idToken ?? null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getValidAuthSession();
  return session?.user ?? null;
};
