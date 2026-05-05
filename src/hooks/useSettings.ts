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

export const useSettings = () => {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const changeLanguage = useCallback(
    (language: AppLanguage) => {
      dispatch(setLanguage(language));
      i18n.changeLanguage(language);
    },
    [dispatch]
  );

  const changeDailyReminderEnabled = useCallback(
    (enabled: boolean) => {
      dispatch(setDailyReminderEnabled(enabled));
    },
    [dispatch]
  );

  const changeTheme = useCallback(
    (theme: AppTheme) => {
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
