import { fireEvent, render, screen } from '@testing-library/react-native';
import '../src/localization/i18n';
import { AddCardTranslateSection } from '../src/components/AddCardTranslateSection';

jest.mock('../src/hooks', () => ({
  // Component testinde Redux/theme provider kurmak yerine yalnizca bu
  // componentin ihtiyaci olan renkleri sabitliyoruz. Testin odagi UI davranisi:
  // Gemini yoksa buton kapali mi ve uyari gorunuyor mu?
  useThemeColors: () => ({
    borderLight: '#dddddd',
    mutedText: '#777777',
    primary: '#2563eb',
    secondarySurface: '#e0f2fe',
    text: '#111111',
  }),
}));

describe('AddCardTranslateSection', () => {
  it('disables auto-translate and shows a warning when Gemini is not configured', () => {
    const onTranslate = jest.fn();

    // isGeminiConfigured=false, .env'de Gemini key yokken parent hook'un bu
    // component'e verecegi durumu simule eder.
    render(
      <AddCardTranslateSection
        meaning=""
        onMeaningChange={jest.fn()}
        onTranslate={onTranslate}
        translateError=""
        isTranslating={false}
        isCooldown={false}
        isGeminiConfigured={false}
      />
    );

    expect(
      screen.getByText(
        'Gemini is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart Expo.'
      )
    ).toBeTruthy();

    fireEvent.press(screen.getByText('Auto-translate'));

    // Disabled button'a basilsa bile translate callback'i calismamali; aksi
    // halde eksik key ile gereksiz network istegi denenirdi.
    expect(onTranslate).not.toHaveBeenCalled();
  });
});
