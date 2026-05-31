// Gemini translation service using REST API.
// Kart ekleme formunda "Auto-translate" butonu bu servisi cagirir.
// Servis yalnizca kisa ceviri metni donmeye zorlayan bir prompt yollar.
import { GEMINI_API_KEY, isGeminiConfigured } from '../constants/config';

type GeminiPart = {
  text: string;
};

type GeminiContent = {
  parts: GeminiPart[];
};

type GeminiRequest = {
  contents: GeminiContent[];
};

type GeminiCandidate = {
  content?: GeminiContent;
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

// Gemini 2.0 Flash yeni API key'lerde "model unavailable" donebildigi icin
// aktif model listesindeki stable Flash modelini kullaniyoruz.
const GEMINI_MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const mapTranslationError = (error: unknown): Error => {
  // Bilinen API hatalarini koruyoruz, beklenmeyen her seyi kullanicinin
  // anlayacagi network hatasina ceviriyoruz.
  if (error instanceof Error) {
    if (error.message === 'Too many requests, please wait') {
      return error;
    }
    if (error.message.startsWith('Translation failed')) {
      return error;
    }
    if (error.message.startsWith('Empty translation response')) {
      return error;
    }
  }

  return new Error('Network error, please check your connection');
};

export const translateWord = async (
  word: string,
  targetLang: string
): Promise<string> => {
  if (!isGeminiConfigured) {
    throw new Error('Translation failed. Configure Gemini API key.');
  }

  // Prompt'a "Return only..." eklenmesinin nedeni, Gemini'nin aciklama veya
  // cumle uretmesi yerine sadece kart anlamina yazilacak kisa cevabi donmesidir.
  const prompt = `Translate the following word to ${targetLang}. Return only the translated word or short phrase, nothing else: ${word}`;

  const body: GeminiRequest = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      // Rate limit ayri yakalanir ki UI "bekle" mesajini gosterebilsin.
      throw new Error('Too many requests, please wait');
    }

    if (!response.ok) {
      let serverMessage = '';
      try {
        const errorBody = (await response.json()) as {
          error?: { message?: string };
        };
        serverMessage = errorBody.error?.message ?? '';
      } catch {
        serverMessage = '';
      }

      if (response.status === 400 || response.status === 401) {
        // API key veya request format sorunlari kullaniciya net soylenir.
        throw new Error('Translation failed. Check your API key and request.');
      }
      if (response.status === 403) {
        throw new Error('Translation failed. Access denied for this API key.');
      }
      throw new Error(
        serverMessage || 'Translation failed. Please try again later.'
      );
    }

    const data = (await response.json()) as GeminiResponse;
    // Gemini cevabinda ilk candidate/part kullaniliyor. Bos cevap gelirse
    // kart anlamini bos kaydetmek yerine hata firlatilir.
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('Empty translation response from Gemini');
    }

    return text;
  } catch (error) {
    throw mapTranslationError(error);
  }
};
