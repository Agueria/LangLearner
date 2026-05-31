import { useSelector } from 'react-redux';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/colors';
import type { RootState } from '../store/store';

// Tek tema kaynagi. Componentler sabit COLORS yerine bu hook'tan gelen palette'i
// kullaninca light/dark mode ayni component icinde otomatik calisir.
export const useThemeColors = () => {
  const theme = useSelector((state: RootState) => state.settings.theme);

  return theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};
