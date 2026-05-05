// Quiz result screen: summarizes the completed study session.
import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/constants';
import { useDecks, useThemeColors } from '../../src/hooks';
import { calculateQuizPercentage, parseResultCount } from '../../src/utils/quizResult';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  deckTitle: {
    color: COLORS.subtleText,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginTop: 24,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    elevation: 4,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  score: {
    color: COLORS.text,
    fontSize: 52,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.slate,
    marginTop: 12,
  },
  statLabel: {
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statText: {
    color: COLORS.subtleText,
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 22,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default function QuizResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { correct, deckId: deckIdParam, incorrect, total } =
    useLocalSearchParams<{
      correct?: string;
      deckId?: string;
      incorrect?: string;
      total?: string;
    }>();
  const deckId = typeof deckIdParam === 'string' ? deckIdParam : '';
  const correctCount = parseResultCount(correct);
  const incorrectCount = parseResultCount(incorrect);
  const totalCount = parseResultCount(total);
  const percentage = calculateQuizPercentage(correctCount, totalCount);
  const { decks } = useDecks();
  const deck = useMemo(
    () => decks.find((item) => item.id === deckId),
    [deckId, decks]
  );

  const handleStudyAgain = useCallback(() => {
    router.replace(`/quiz/${deckId}`);
  }, [deckId, router]);

  const handleBackToDeck = useCallback(() => {
    router.push(`/deck/${deckId}`);
  }, [deckId, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInUp.duration(320)}
        style={[
          styles.resultCard,
          { backgroundColor: colors.surface, shadowColor: colors.shadow },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t('quiz.complete')}
        </Text>
        <Text style={[styles.deckTitle, { color: colors.subtleText }]}>
          {deck?.title ?? t('decks.deck')}
        </Text>
        <Animated.Text entering={ZoomIn.delay(120)} style={styles.score}>
          {percentage}%
        </Animated.Text>
        <Text style={[styles.statLabel, { color: colors.mutedText }]}>
          {t('quiz.remembered')}
        </Text>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: colors.subtleText }]}>
            {t('quiz.known')}: {correctCount}
          </Text>
          <Text style={[styles.statText, { color: colors.subtleText }]}>
            {t('quiz.practice')}: {incorrectCount}
          </Text>
          <Text style={[styles.statText, { color: colors.subtleText }]}>
            {t('quiz.total')}: {totalCount}
          </Text>
        </View>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleStudyAgain}
        >
          <Text style={styles.buttonText}>{t('quiz.studyAgain')}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={handleBackToDeck}
        >
          <Text style={styles.buttonText}>{t('actions.backToDeck')}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
