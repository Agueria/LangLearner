// Runtime config sourced from Expo environment variables.
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_GEMINI_API_KEY. Set it in .env and restart Metro.'
  );
}

export const GEMINI_API_KEY = apiKey;
