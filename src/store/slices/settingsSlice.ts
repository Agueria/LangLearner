import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
