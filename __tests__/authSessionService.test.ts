import * as SecureStore from 'expo-secure-store';
import type { AuthSession } from '../src/constants/types';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '../src/services/authSessionService';

const mockedSecureStore = jest.mocked(SecureStore);

// Bu fixture gercek Firebase cevabinin uygulamada saklanan sade halidir:
// tokenlar tokens altinda, public kullanici bilgisi user altinda tutulur.
const session: AuthSession = {
  tokens: {
    expiresAt: 4102444800000,
    idToken: 'id-token',
    refreshToken: 'refresh-token',
  },
  user: {
    email: 'student@example.com',
    id: 'user-1',
  },
};

describe('auth session service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores the auth session as JSON in SecureStore', async () => {
    await saveAuthSession(session);

    // SecureStore yalnizca string sakladigi icin servis JSON serialize eder.
    // Bu test tokenlarin Redux/AsyncStorage'a degil SecureStore'a gittigini de
    // dolayli olarak garanti eder.
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      'langlearner.auth.session',
      JSON.stringify(session)
    );
  });

  it('returns null when no session is stored', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);

    await expect(loadAuthSession()).resolves.toBeNull();
  });

  it('loads a valid stored session', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(session));

    await expect(loadAuthSession()).resolves.toEqual(session);
  });

  it('deletes corrupt session JSON and returns null', async () => {
    // Cihazda eski/bozulmus bir session kalirsa uygulama crash etmek yerine
    // login ekranina donmeli. Bu senaryo o recovery davranisini kilitler.
    mockedSecureStore.getItemAsync.mockResolvedValue('{not-json');

    await expect(loadAuthSession()).resolves.toBeNull();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'langlearner.auth.session'
    );
  });

  it('clears the stored auth session', async () => {
    await clearAuthSession();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'langlearner.auth.session'
    );
  });
});
