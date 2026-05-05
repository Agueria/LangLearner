export type ColorPalette = {
  background: string;
  border: string;
  borderLight: string;
  canvas: string;
  danger: string;
  mutedText: string;
  mutedTextAlt: string;
  overlay: string;
  primary: string;
  secondarySurface: string;
  shadow: string;
  slate: string;
  subtleText: string;
  surface: string;
  text: string;
  white: string;
};

export const LIGHT_COLORS: ColorPalette = {
  background: '#F7F7F2',
  border: '#D7DCE5',
  borderLight: '#DADADA',
  canvas: '#F5F7FB',
  danger: '#D62828',
  mutedText: '#5B5B5B',
  mutedTextAlt: '#6B6B6B',
  overlay: 'rgba(0, 0, 0, 0.4)',
  primary: '#1F6FEB',
  secondarySurface: '#E9EEF9',
  shadow: '#000000',
  slate: '#3E4C64',
  subtleText: '#4E4E4E',
  surface: '#FFFFFF',
  text: '#1F1F1F',
  white: '#FFFFFF',
};

export const DARK_COLORS: ColorPalette = {
  background: '#111827',
  border: '#334155',
  borderLight: '#475569',
  canvas: '#1F2937',
  danger: '#EF4444',
  mutedText: '#CBD5E1',
  mutedTextAlt: '#94A3B8',
  overlay: 'rgba(0, 0, 0, 0.62)',
  primary: '#60A5FA',
  secondarySurface: '#1E3A5F',
  shadow: '#000000',
  slate: '#64748B',
  subtleText: '#E2E8F0',
  surface: '#1F2937',
  text: '#F8FAFC',
  white: '#FFFFFF',
};

export const COLORS = LIGHT_COLORS;
