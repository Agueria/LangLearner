// Quiz screen: studies cards from a selected deck and tracks the score.
import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/constants';
import { useCards, useDecks, useQuiz, type QuizAnswer } from '../../src/hooks';

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    elevation: 4,
    marginTop: 18,
    minHeight: 280,
    padding: 22,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: 16,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  deckTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 18,
  },
  emptyText: {
    color: COLORS.mutedText,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 24,
    textAlign: 'center',
  },
  label: {
    color: COLORS.mutedTextAlt,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  meaning: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  mutedMeaning: {
    color: COLORS.subtleText,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  progress: {
    color: COLORS.mutedText,
    fontSize: 14,
    marginTop: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  scoreText: {
    color: COLORS.subtleText,
    fontSize: 14,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: COLORS.slate,
  },
  word: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 18,
  },
});

export default function QuizScreen() {
  const router = useRouter();
  const { deckId: deckIdParam } = useLocalSearchParams<{ deckId: string }>();
  const deckId = typeof deckIdParam === 'string' ? deckIdParam : '';
  const { decks } = useDecks();
  const { cards } = useCards();
  const deck = useMemo(
    () => decks.find((item) => item.id === deckId),
    [deckId, decks]
  );
  const deckCards = useMemo(
    () => cards.filter((card) => card.deckId === deckId),
    [cards, deckId]
  );
  const {
    currentCard,
    correctCount,
    incorrectCount,
    isAnswerVisible,
    progressLabel,
    answerCard,
    showAnswer,
  } = useQuiz(deckCards);

  const handleBackToDeck = useCallback(() => {
    router.push(`/deck/${deckId}`);
  }, [deckId, router]);

  const handleAnswer = useCallback(
    (answer: QuizAnswer) => {
      const result = answerCard(answer);

      if (result.isComplete) {
        router.replace({
          pathname: '/quiz/result',
          params: {
            correct: String(result.correctCount),
            deckId,
            incorrect: String(result.incorrectCount),
            total: String(result.totalCount),
          },
        });
      }
    },
    [answerCard, deckId, router]
  );

  if (!deck) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={handleBackToDeck}>
          <Text style={styles.backText}>Back to Deck</Text>
        </Pressable>
        <Text style={styles.emptyText}>Deck not found.</Text>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={handleBackToDeck}>
          <Text style={styles.backText}>Back to Deck</Text>
        </Pressable>
        <Text style={styles.deckTitle}>{deck.title}</Text>
        <Text style={styles.emptyText}>
          Add at least one card before starting a quiz.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={handleBackToDeck}>
        <Text style={styles.backText}>Back to Deck</Text>
      </Pressable>
      <Text style={styles.deckTitle}>{deck.title}</Text>
      <Text style={styles.progress}>{progressLabel}</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>Known: {correctCount}</Text>
        <Text style={styles.scoreText}>Practice: {incorrectCount}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Word</Text>
        <Text style={styles.word}>{currentCard.word}</Text>
        {isAnswerVisible ? (
          <>
            <Text style={styles.label}>Meaning</Text>
            <Text style={styles.meaning}>{currentCard.meaning}</Text>
          </>
        ) : (
          <Text style={styles.mutedMeaning}>
            Try to remember the meaning before revealing the answer.
          </Text>
        )}
        <Pressable
          style={styles.primaryButton}
          onPress={showAnswer}
          disabled={isAnswerVisible}
        >
          <Text style={styles.primaryButtonText}>
            {isAnswerVisible ? 'Answer shown' : 'Show Answer'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[
            styles.actionButton,
            styles.dangerButton,
            !isAnswerVisible && styles.actionButtonDisabled,
          ]}
          onPress={() => handleAnswer('incorrect')}
          disabled={!isAnswerVisible}
        >
          <Text style={styles.actionLabel}>Need Practice</Text>
        </Pressable>
        <Pressable
          style={[
            styles.actionButton,
            styles.successButton,
            !isAnswerVisible && styles.actionButtonDisabled,
          ]}
          onPress={() => handleAnswer('correct')}
          disabled={!isAnswerVisible}
        >
          <Text style={styles.actionLabel}>I Knew It</Text>
        </Pressable>
      </View>
    </View>
  );
}
