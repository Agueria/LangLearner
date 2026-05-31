import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/constants';
import { useAuth, useThemeColors } from '../../src/hooks';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  input: {
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.subtleText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
});

export default function RegisterScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { error, isConfigured, isLoading, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const localError = useMemo(() => {
    if (password.length > 0 && password.length < 6) {
      return t('auth.passwordTooShort');
    }
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      return t('auth.passwordMismatch');
    }
    return '';
  }, [confirmPassword, password, t]);

  const handleSubmit = useCallback(() => {
    if (localError) {
      return;
    }
    register({ email, password });
  }, [email, localError, password, register]);

  const isDisabled = isLoading || !isConfigured || Boolean(localError);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('auth.registerTitle')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtleText }]}>
        {t('auth.registerSubtitle')}
      </Text>
      {!isConfigured && (
        <Text style={styles.error}>{t('auth.firebaseMissing')}</Text>
      )}
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder={t('auth.email')}
        placeholderTextColor={colors.mutedTextAlt}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder={t('auth.password')}
        placeholderTextColor={colors.mutedTextAlt}
        secureTextEntry
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={password}
      />
      <TextInput
        onChangeText={setConfirmPassword}
        placeholder={t('auth.confirmPassword')}
        placeholderTextColor={colors.mutedTextAlt}
        secureTextEntry
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={confirmPassword}
      />
      {localError.length > 0 && <Text style={styles.error}>{localError}</Text>}
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      <Pressable
        disabled={isDisabled}
        onPress={handleSubmit}
        style={[styles.button, isDisabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{t('auth.register')}</Text>
      </Pressable>
      <Link href="/auth/login" style={styles.link}>
        {t('auth.haveAccount')}
      </Link>
    </View>
  );
}
