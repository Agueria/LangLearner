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
  FIREBASE_API_KEY: 'firebase-key',
  FIREBASE_PROJECT_ID: 'firebase-project',
  isFirebaseConfigured: true,
}));

jest.mock('../src/services/authSessionService', () => ({
  clearAuthSession: jest.fn(),
  loadAuthSession: jest.fn(),
  saveAuthSession: jest.fn(),
}));

const responseWithCode = (message: string) =>
  ({
    json: async () => ({ error: { message } }),
  }) as Response;

const mockedFetch = jest.fn();
const mockedClearAuthSession = jest.mocked(clearAuthSession);
const mockedLoadAuthSession = jest.mocked(loadAuthSession);
const mockedSaveAuthSession = jest.mocked(saveAuthSession);

const storedSession: AuthSession = {
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
      expect.objectContaining({
        tokens: expect.objectContaining({ idToken: 'id-token' }),
      })
    );
  });

  it('refreshes an expired session and preserves the user email', async () => {
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

    await expect(getValidAuthSession()).resolves.toBe(storedSession);
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
