// Runtime config sourced from Expo environment variables.
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_GEMINI_API_KEY. Set it in .env and restart Metro.'
  );
}

export const GEMINI_API_KEY = apiKey;

export const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
export const FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';

export const isFirebaseConfigured = Boolean(
  FIREBASE_API_KEY && FIREBASE_PROJECT_ID
);
