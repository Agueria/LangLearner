import {
  getValidAuthSession,
  mapFirebaseAuthError,
  refreshAuthSession,
  registerWithEmail,
} from '../src/services/firebaseAuthService';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '../src/services/authSessionService';
import type { AuthSession } from '../src/constants/types';

jest.mock('../src/constants/config', () => ({
  // Auth servisinin gercek network endpoint formatini test ediyoruz, ama
  // test ortaminda gercek Firebase projesine gitmemek icin key/project mock.
  FIREBASE_API_KEY: 'firebase-key',
  FIREBASE_PROJECT_ID: 'firebase-project',
  isFirebaseConfigured: true,
}));

jest.mock('../src/services/authSessionService', () => ({
  // Token saklama bu dosyanin sorumlulugu degil. Burada sadece Auth servisinin
  // dogru anda save/clear cagirip cagirmadigini kontrol ediyoruz.
  clearAuthSession: jest.fn(),
  loadAuthSession: jest.fn(),
  saveAuthSession: jest.fn(),
}));

const responseWithCode = (message: string) =>
  // Firebase REST hata cevabi { error: { message: "CODE" } } seklinde gelir.
  // Helper bu formati tekrar tekrar yazmayi engeller.
  ({
    json: async () => ({ error: { message } }),
  }) as Response;

const mockedFetch = jest.fn();
const mockedClearAuthSession = jest.mocked(clearAuthSession);
const mockedLoadAuthSession = jest.mocked(loadAuthSession);
const mockedSaveAuthSession = jest.mocked(saveAuthSession);

const storedSession: AuthSession = {
  // expiresAt bilerek uzak gelecek olarak verildi. getValidAuthSession testi,
  // hala gecerli session icin refresh endpoint'ine gitmedigimizi kanitlar.
  tokens: {
    expiresAt: 4102444800000,
    idToken: 'old-id-token',
    refreshToken: 'old-refresh-token',
  },
  user: {
    email: 'student@example.com',
    id: 'user-1',
  },
};

describe('Firebase auth service', () => {
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockedFetch as unknown as typeof fetch;
    // Token expiry hesaplari Date.now'a bagli. Sabit zaman, testte beklenen
    // expiresAt degerini deterministik yapar.
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('maps duplicate email errors to a user-facing message', async () => {
    await expect(mapFirebaseAuthError(responseWithCode('EMAIL_EXISTS'))).resolves.toBe(
      'This email is already registered.'
    );
  });

  it('maps invalid login credentials to a single safe message', async () => {
    await expect(
      mapFirebaseAuthError(responseWithCode('INVALID_PASSWORD'))
    ).resolves.toBe('Email or password is incorrect.');
  });

  it('registers with trimmed email and stores the returned session', async () => {
    // Firebase signUp cevabi expiresIn'i saniye string'i olarak verir. Servis
    // bunu absolute timestamp'e cevirip SecureStore session'i olarak kaydeder.
    mockedFetch.mockResolvedValue({
      json: async () => ({
        email: 'student@example.com',
        expiresIn: '3600',
        idToken: 'id-token',
        localId: 'user-1',
        refreshToken: 'refresh-token',
      }),
      ok: true,
    });

    await expect(
      registerWithEmail({
        email: ' student@example.com ',
        password: 'secret123',
      })
    ).resolves.toEqual({
      tokens: {
        expiresAt: 3601000,
        idToken: 'id-token',
        refreshToken: 'refresh-token',
      },
      user: {
        displayName: undefined,
        email: 'student@example.com',
        id: 'user-1',
      },
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=firebase-key',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'student@example.com',
          password: 'secret123',
          returnSecureToken: true,
        }),
        method: 'POST',
      })
    );
    expect(mockedSaveAuthSession).toHaveBeenCalledWith(
      // Token degerinin kaydedildigini kontrol ediyoruz; tam obje yukarida
      // resolve expectation'inda zaten dogrulaniyor.
      expect.objectContaining({
        tokens: expect.objectContaining({ idToken: 'id-token' }),
      })
    );
  });

  it('refreshes an expired session and preserves the user email', async () => {
    // securetoken endpoint'i email dondurmez; bu yuzden servis eski session'daki
    // user.email bilgisini korumali ve sadece tokenlari yenilemelidir.
    mockedFetch.mockResolvedValue({
      json: async () => ({
        expires_in: '3600',
        id_token: 'new-id-token',
        refresh_token: 'new-refresh-token',
        user_id: 'user-1',
      }),
      ok: true,
    });

    await expect(refreshAuthSession(storedSession)).resolves.toEqual({
      tokens: {
        expiresAt: 3601000,
        idToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
      },
      user: storedSession.user,
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://securetoken.googleapis.com/v1/token?key=firebase-key',
      expect.objectContaining({
        body: 'grant_type=refresh_token&refresh_token=old-refresh-token',
        method: 'POST',
      })
    );
    expect(mockedSaveAuthSession).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: expect.objectContaining({ idToken: 'new-id-token' }),
      })
    );
  });

  it('clears the local session when refresh token is rejected', async () => {
    // Refresh token gecersizse bozuk session'i cihazda tutmak kullaniciyi
    // sonsuz hata dongusune sokar. Bu yuzden servis once clearAuthSession yapar.
    mockedFetch.mockResolvedValue({
      json: async () => ({ error: { message: 'TOKEN_EXPIRED' } }),
      ok: false,
    });

    await expect(refreshAuthSession(storedSession)).rejects.toThrow(
      'Your session expired. Please sign in again.'
    );
    expect(mockedClearAuthSession).toHaveBeenCalledTimes(1);
  });

  it('returns a still-valid stored session without refreshing it', async () => {
    mockedLoadAuthSession.mockResolvedValue(storedSession);

    // Token expiry safety window disindaysa network'e gitmeden mevcut session
    // kullanilir. Bu, app acilisini hizlandirir ve gereksiz quota tuketmez.
    await expect(getValidAuthSession()).resolves.toBe(storedSession);
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
