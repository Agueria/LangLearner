// Runtime config sourced from Expo environment variables.
// EXPO_PUBLIC_* degiskenleri Expo tarafindan bundle'a gomulur. Bu yuzden
// gercek sir saklama yeri degildir; burada amac key'leri kod icine hardcode
// etmemek ve farkli ortamlar icin kolay degistirebilmektir.
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

// Firebase opsiyonel konfigurasyon olarak kontrol edilir. Gemini zorunlu,
// Firebase ise kullanici env girene kadar auth ekraninda acik hata verir.
export const isFirebaseConfigured = Boolean(
  FIREBASE_API_KEY && FIREBASE_PROJECT_ID
);
