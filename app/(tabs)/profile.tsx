// Profile tab for local settings.
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/constants';
import {
  useAuth,
  useCloudSync,
  useSettings,
  useThemeColors,
} from '../../src/hooks';
import {
  cancelDailyReminder,
  playLightHaptic,
  scheduleDailyReminder,
} from '../../src/services';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: 16,
  },
  disabledButton: {
    opacity: 0.55,
  },
  helperText: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  optionButton: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextActive: {
    color: COLORS.white,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statusText: {
    color: COLORS.subtleText,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
});

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { error: syncError, isSyncing, lastSyncedAt, pendingCount, syncNow } =
    useCloudSync();
  const {
    dailyReminderEnabled,
    language,
    setDailyReminderEnabled,
    setLanguage,
    setTheme,
    theme,
  } = useSettings();
  const colors = useThemeColors();
  const [isReminderUpdating, setIsReminderUpdating] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  const handleLanguageChange = useCallback(
    (nextLanguage: 'en' | 'tr') => {
      playLightHaptic().catch(() => undefined);
      setLanguage(nextLanguage);
    },
    [setLanguage]
  );

  const handleThemeChange = useCallback(
    (nextTheme: 'dark' | 'light') => {
      playLightHaptic().catch(() => undefined);
      setTheme(nextTheme);
    },
    [setTheme]
  );

  const handleReminderToggle = useCallback(
    async (enabled: boolean) => {
      if (isReminderUpdating) {
        return;
      }

      playLightHaptic().catch(() => undefined);
      setIsReminderUpdating(true);

      try {
        if (!enabled) {
          await cancelDailyReminder();
          setDailyReminderEnabled(false);
          setReminderMessage(t('notifications.disabled'));
          return;
        }

        const wasScheduled = await scheduleDailyReminder({
          body: t('notifications.body'),
          title: t('notifications.title'),
        });

        setDailyReminderEnabled(wasScheduled);
        setReminderMessage(
          wasScheduled
            ? t('notifications.scheduled')
            : t('notifications.permissionDenied')
        );
      } finally {
        setIsReminderUpdating(false);
      }
    },
    [isReminderUpdating, setDailyReminderEnabled, t]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('profile.settings')}
      </Text>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('auth.account')}
        </Text>
        <Text style={[styles.helperText, { color: colors.mutedText }]}>
          {user?.email ?? t('auth.signedIn')}
        </Text>
        <Pressable style={styles.optionButton} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: colors.text }]}>
            {t('auth.logout')}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('sync.title')}
        </Text>
        <Text style={[styles.helperText, { color: colors.mutedText }]}>
          {pendingCount > 0
            ? t('sync.pending', { count: pendingCount })
            : t('sync.upToDate')}
        </Text>
        {lastSyncedAt.length > 0 && (
          <Text style={[styles.helperText, { color: colors.mutedText }]}>
            {t('sync.lastSynced', {
              value: new Date(lastSyncedAt).toLocaleString(),
            })}
          </Text>
        )}
        {syncError.length > 0 && (
          <Text style={[styles.statusText, { color: colors.danger }]}>
            {syncError}
          </Text>
        )}
        <Pressable
          disabled={isSyncing}
          onPress={syncNow}
          style={[styles.optionButton, isSyncing && styles.disabledButton]}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>
            {isSyncing ? t('sync.syncing') : t('sync.syncNow')}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('profile.language')}
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border },
              language === 'en' && styles.optionButtonActive,
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.text },
                language === 'en' && styles.optionTextActive,
              ]}
            >
              {t('profile.english')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border },
              language === 'tr' && styles.optionButtonActive,
            ]}
            onPress={() => handleLanguageChange('tr')}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.text },
                language === 'tr' && styles.optionTextActive,
              ]}
            >
              {t('profile.turkish')}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('profile.theme')}
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border },
              theme === 'light' && styles.optionButtonActive,
            ]}
            onPress={() => handleThemeChange('light')}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.text },
                theme === 'light' && styles.optionTextActive,
              ]}
            >
              {t('profile.light')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border },
              theme === 'dark' && styles.optionButtonActive,
            ]}
            onPress={() => handleThemeChange('dark')}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.text },
                theme === 'dark' && styles.optionTextActive,
              ]}
            >
              {t('profile.dark')}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('profile.reminder')}
            </Text>
            <Text style={[styles.helperText, { color: colors.mutedText }]}>
              {dailyReminderEnabled
                ? t('notifications.enabled')
                : t('notifications.disabled')}
            </Text>
          </View>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={handleReminderToggle}
            disabled={isReminderUpdating}
          />
        </View>
        {reminderMessage.length > 0 && (
          <Text style={[styles.statusText, { color: colors.subtleText }]}>
            {reminderMessage}
          </Text>
        )}
      </View>
    </View>
  );
}
