describe('runtime config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('does not crash the app when Gemini key is missing', () => {
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

    expect(config.GEMINI_API_KEY).toBe('');
    expect(config.isGeminiConfigured).toBe(false);
  });
});
