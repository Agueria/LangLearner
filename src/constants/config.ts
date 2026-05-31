// Runtime config sourced from Expo environment variables.
// EXPO_PUBLIC_* degiskenleri Expo tarafindan bundle'a gomulur. Bu yuzden
// gercek sir saklama yeri degildir; burada amac key'leri kod icine hardcode
// etmemek ve farkli ortamlar icin kolay degistirebilmektir.
export const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
// Bu boolean, API key'in kendisini ekrana/log'a tasimadan "Gemini hazir mi?"
// sorusunu cevaplar. AddCardTranslateSection butonu bu degere gore kapanir.
export const isGeminiConfigured = Boolean(GEMINI_API_KEY);

export const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
export const FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';

// Firebase ve Gemini opsiyonel konfigurasyon olarak kontrol edilir. Env yoksa
// uygulama import aninda crash etmez; ilgili UI acik hata/uyari gosterir.
// Firebase icin iki deger de gerekli: Web API key Auth REST endpoint'ine,
// project id ise Firestore REST endpoint path'ine girer.
export const isFirebaseConfigured = Boolean(
  FIREBASE_API_KEY && FIREBASE_PROJECT_ID
);
