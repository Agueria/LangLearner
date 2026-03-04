// Gemini translation service using REST API.
import { GEMINI_API_KEY } from '../constants/config';

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

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const translateWord = async (
  word: string,
  targetLang: string
): Promise<string> => {
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('Empty translation response from Gemini');
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Too many requests, please wait') {
        throw error;
      }
      if (error.message.startsWith('Translation failed')) {
        throw error;
      }
      if (error.message.startsWith('Empty translation response')) {
        throw error;
      }
    }
    throw new Error('Network error, please check your connection');
  }
};
