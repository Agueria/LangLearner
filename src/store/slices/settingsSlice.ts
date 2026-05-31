import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Settings slice, kullanicinin uygulama tercihlerini tutar.
// Bu slice persist edildigi icin dil, tema ve reminder tercihi uygulama
// kapanip acilsa da ayni kalir.
export type AppLanguage = 'en' | 'tr';
export type AppTheme = 'dark' | 'light';

type SettingsState = {
  language: AppLanguage;
  dailyReminderEnabled: boolean;
  theme: AppTheme;
};

const initialState: SettingsState = {
  language: 'en',
  dailyReminderEnabled: false,
  theme: 'light',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<AppLanguage>) {
      // Dil degisimi Redux'a yazilir; useSettings hook'u i18n tarafini da
      // ayni anda gunceller.
      return { ...state, language: action.payload };
    },
    setDailyReminderEnabled(state, action: PayloadAction<boolean>) {
      return { ...state, dailyReminderEnabled: action.payload };
    },
    setTheme(state, action: PayloadAction<AppTheme>) {
      return { ...state, theme: action.payload };
    },
  },
});

export const { setDailyReminderEnabled, setLanguage, setTheme } =
  settingsSlice.actions;
export default settingsSlice.reducer;
