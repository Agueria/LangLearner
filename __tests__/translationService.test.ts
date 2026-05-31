import {
  mapTranslationError,
  translateWord,
} from '../src/services/translationService';

jest.mock('../src/constants/config', () => ({
  // Unit testler gercek Gemini key kullanmaz. Servisin endpoint/body/error
  // mantigini test etmek icin config sabit ve guvenli bir mock degerdir.
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
    // Gemini response yapisi nested candidates/content/parts seklindedir.
    // Servis bu derin objeden ilk text'i trimleyip form alanina yazilacak
    // sade string'e cevirir.
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: ' merhaba ' }] } }],
      }),
      status: 200,
    });

    await expect(translateWord('hello', 'TR')).resolves.toBe('merhaba');
    // Model adinin regression ile eski unavailable modele donmesini istemiyoruz.
    // Bu assertion endpoint'teki aktif modeli kilitler.
    expect(mockedFetch.mock.calls[0][0]).toContain(
      'models/gemini-2.5-flash:generateContent'
    );
  });

  it('maps rate limit responses to a friendly message', async () => {
    // 429, kullanicinin pes pese Auto-translate denediginde gorebilecegi en
    // olasi servis hatasidir. UI bunu "bekle" mesaji olarak gosterir.
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 429,
    });

    await expect(translateWord('hello', 'TR')).rejects.toThrow(
      'Too many requests, please wait'
    );
  });

  it('maps invalid Gemini key or request responses to a setup message', async () => {
    // 400/401 genelde key hatasi veya request format sorunu anlamina gelir.
    // Bu mesaj gelistiriciye .env/API key kontrolu yaptirir.
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
    // 403 key'in var ama ilgili API/proje izni yok anlamina gelebilir. Bu
    // nedenle network yerine "access denied" mesaji korunur.
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
    // Server'in teknik hata metnini aynen UI'a basmiyoruz; kullaniciya guvenli
    // ve sade bir retry mesaji gosteriyoruz.
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
    // Gemini 200 donse bile text bos olabilir. Bos anlam kaydetmek kullanici
    // verisini kirletir, bu yuzden explicit hata firlatilir.
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
    // mapTranslationError bilinen servis hatalarini generic network hatasina
    // cevirmemeli; aksi halde UI daha faydali mesajlari kaybeder.
    const error = new Error('Translation failed. Access denied for this API key.');

    expect(mapTranslationError(error)).toBe(error);
  });

  it('maps unknown failures to a network error', () => {
    // Socket kapanmasi, DNS veya fetch throw gibi beklenmeyen durumlarda
    // kullaniciya uygulanabilir tek mesaj baglantiyi kontrol etmesidir.
    expect(mapTranslationError(new Error('socket closed')).message).toBe(
      'Network error, please check your connection'
    );
  });
});
