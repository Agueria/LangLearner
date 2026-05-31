import {
  mapTranslationError,
  translateWord,
} from '../src/services/translationService';

jest.mock('../src/constants/config', () => ({
  GEMINI_API_KEY: 'test-api-key',
  isGeminiConfigured: true,
}));

const mockedFetch = jest.fn();

describe('translation service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  it('returns the first Gemini candidate text', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: ' merhaba ' }] } }],
      }),
      status: 200,
    });

    await expect(translateWord('hello', 'TR')).resolves.toBe('merhaba');
    expect(mockedFetch.mock.calls[0][0]).toContain(
      'models/gemini-2.5-flash:generateContent'
    );
  });

  it('maps rate limit responses to a friendly message', async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 429,
    });

    await expect(translateWord('hello', 'TR')).rejects.toThrow(
      'Too many requests, please wait'
    );
  });

  it('maps invalid Gemini key or request responses to a setup message', async () => {
    mockedFetch.mockResolvedValue({
      json: async () => ({ error: { message: 'API key not valid' } }),
      ok: false,
      status: 400,
    });

    await expect(translateWord('hello', 'TR')).rejects.toThrow(
      'Translation failed. Check your API key and request.'
    );
  });

  it('maps Gemini access denied responses to a permission message', async () => {
    mockedFetch.mockResolvedValue({
      json: async () => ({ error: { message: 'permission denied' } }),
      ok: false,
      status: 403,
    });

    await expect(translateWord('hello', 'TR')).rejects.toThrow(
      'Translation failed. Access denied for this API key.'
    );
  });

  it('maps unexpected failed responses to a safe retry message', async () => {
    mockedFetch.mockResolvedValue({
      json: async () => ({ error: { message: 'model temporarily unavailable' } }),
      ok: false,
      status: 503,
    });

    await expect(translateWord('hello', 'TR')).rejects.toThrow(
      'Translation failed. Please try again later.'
    );
  });

  it('rejects empty Gemini responses instead of saving a blank meaning', async () => {
    mockedFetch.mockResolvedValue({
      json: async () => ({ candidates: [{ content: { parts: [] } }] }),
      ok: true,
      status: 200,
    });

    await expect(translateWord('hello', 'TR')).rejects.toThrow(
      'Empty translation response from Gemini'
    );
  });

  it('preserves known translation errors', () => {
    const error = new Error('Translation failed. Access denied for this API key.');

    expect(mapTranslationError(error)).toBe(error);
  });

  it('maps unknown failures to a network error', () => {
    expect(mapTranslationError(new Error('socket closed')).message).toBe(
      'Network error, please check your connection'
    );
  });
});
