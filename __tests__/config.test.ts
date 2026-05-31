describe('runtime config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Config module'u import aninda env okur. Her testte module cache'i
    // sifirlayarak farkli .env senaryolarini gercek import gibi deneriz.
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('does not crash the app when Gemini key is missing', () => {
    // Bu senaryo production'da hocanin/CI'in .env olmadan app'i acmasini
    // temsil eder. Beklenen davranis: uygulama acilir, sadece Gemini ozelligi
    // disabled olur.
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    expect(() => {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      require('../src/constants/config');
    }).not.toThrow();
  });

  it('exposes Gemini configuration state separately from the raw key', () => {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const config = require('../src/constants/config') as typeof import('../src/constants/config');

    // Key string'i bos kalir; UI tarafinin guvenli sekilde kullanacagi asil
    // bilgi ise isGeminiConfigured boolean'idir.
    expect(config.GEMINI_API_KEY).toBe('');
    expect(config.isGeminiConfigured).toBe(false);
  });
});
