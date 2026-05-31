import { mapFirebaseAuthError } from '../src/services/firebaseAuthService';

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

describe('Firebase auth service', () => {
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
});
