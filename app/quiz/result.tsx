// Quiz result screen: summarizes the completed study session.
import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/constants';
import { useDecks } from '../../src/hooks';

const parseCount = (value: string | string[] | undefined): number => {
  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

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
  const { correct, deckId: deckIdParam, incorrect, total } =
    useLocalSearchParams<{
      correct?: string;
      deckId?: string;
      incorrect?: string;
      total?: string;
    }>();
  const deckId = typeof deckIdParam === 'string' ? deckIdParam : '';
  const correctCount = parseCount(correct);
  const incorrectCount = parseCount(incorrect);
  const totalCount = parseCount(total);
  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
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
    <View style={styles.container}>
      <View style={styles.resultCard}>
        <Text style={styles.title}>Quiz Complete</Text>
        <Text style={styles.deckTitle}>{deck?.title ?? 'Deck'}</Text>
        <Text style={styles.score}>{percentage}%</Text>
        <Text style={styles.statLabel}>Remembered</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Known: {correctCount}</Text>
          <Text style={styles.statText}>Practice: {incorrectCount}</Text>
          <Text style={styles.statText}>Total: {totalCount}</Text>
        </View>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleStudyAgain}
        >
          <Text style={styles.buttonText}>Study Again</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={handleBackToDeck}
        >
          <Text style={styles.buttonText}>Back to Deck</Text>
        </Pressable>
      </View>
    </View>
  );
}
