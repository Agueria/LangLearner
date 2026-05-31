import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import i18n from '../localization/i18n';
import type { AppDispatch, RootState } from '../store/store';
import {
  setDailyReminderEnabled,
  setLanguage,
  setTheme,
  type AppLanguage,
  type AppTheme,
} from '../store/slices/settingsSlice';

// useSettings, Redux settings slice ile i18next arasindaki koprudur.
// Ekranlar sadece setLanguage/setTheme cagirir; hook hem Redux'u hem de
// i18n runtime dilini senkron tutar.
export const useSettings = () => {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Persist'ten eski dil yuklendiginde i18n hala default "en" olabilir.
    // Bu effect, store'daki dil ile i18n runtime dilini esitler.
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const changeLanguage = useCallback(
    (language: AppLanguage) => {
      // Aninda UI degissin diye i18n.changeLanguage burada direkt cagrilir.
      // Persist sayesinde secim uygulama tekrar acildiginda da korunur.
      dispatch(setLanguage(language));
      i18n.changeLanguage(language);
    },
    [dispatch]
  );

  const changeDailyReminderEnabled = useCallback(
    (enabled: boolean) => {
      // Native notification schedule islemi Profile ekraninda yapilir.
      // Burada sadece kullanicinin tercih state'i tutulur.
      dispatch(setDailyReminderEnabled(enabled));
    },
    [dispatch]
  );

  const changeTheme = useCallback(
    (theme: AppTheme) => {
      // Tema palette secimi useThemeColors hook'u tarafindan okunur.
      dispatch(setTheme(theme));
    },
    [dispatch]
  );

  return {
    dailyReminderEnabled: settings.dailyReminderEnabled,
    language: settings.language,
    setDailyReminderEnabled: changeDailyReminderEnabled,
    setLanguage: changeLanguage,
    setTheme: changeTheme,
    theme: settings.theme,
  };
};
