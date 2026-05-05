// Home tab placeholder for language-learning dashboard content.
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/constants';
import { useThemeColors } from '../../src/hooks';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  subtitle: {
    color: COLORS.subtleText,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
});

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('home.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtleText }]}>
        {t('home.subtitle')}
      </Text>
    </View>
  );
}
