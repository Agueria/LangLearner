// Runtime config sourced from Expo environment variables.
// EXPO_PUBLIC_* degiskenleri Expo tarafindan bundle'a gomulur. Bu yuzden
// gercek sir saklama yeri degildir; burada amac key'leri kod icine hardcode
// etmemek ve farkli ortamlar icin kolay degistirebilmektir.
export const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
export const isGeminiConfigured = Boolean(GEMINI_API_KEY);

export const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
export const FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';

// Firebase ve Gemini opsiyonel konfigurasyon olarak kontrol edilir. Env yoksa
// uygulama import aninda crash etmez; ilgili UI acik hata/uyari gosterir.
export const isFirebaseConfigured = Boolean(
  FIREBASE_API_KEY && FIREBASE_PROJECT_ID
);
