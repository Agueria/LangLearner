// Quiz screen: secilen destedeki kartlari calisma akisi.
// Bu ekran useQuiz hook'undan skor/state alir, Reanimated ile flip/swipe
// animasyonlarini cizer ve cevaplarda haptic feedback verir.
import { useCallback, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/constants';
import {
  useCards,
  useDecks,
  useQuiz,
  useThemeColors,
  type QuizAnswer,
} from '../../src/hooks';
import {
  playCorrectHaptic,
  playIncorrectHaptic,
  playLightHaptic,
} from '../../src/services';

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
  cardFace: {
    backfaceVisibility: 'hidden',
  },
  cardFaceAnswered: {
    // Cevap acikken kartin ust kosesinde swipe rozetleri gosteriliyor.
    // Icerigi asagi almak, "Meaning" ve kelime metninin bu rozetlerin altinda
    // kalmasini engeller.
    paddingTop: 58,
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
  overlayLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  practiceBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    left: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    top: 20,
    zIndex: 2,
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
  swipeHint: {
    color: COLORS.mutedText,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  swipeKnownBadge: {
    backgroundColor: COLORS.slate,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 2,
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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { deckId: deckIdParam } = useLocalSearchParams<{ deckId: string }>();
  const deckId = typeof deckIdParam === 'string' ? deckIdParam : '';
  const { decks } = useDecks();
  const { cards } = useCards();
  const deck = useMemo(
    // Route'taki deckId ile Redux'taki deck'i eslestiriyoruz.
    () => decks.find((item) => item.id === deckId),
    [deckId, decks]
  );
  const deckCards = useMemo(
    // Quiz sadece secili deck'in kartlariyla calisir.
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
  const flipProgress = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const screenContainerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: colors.background,
        // Quiz route'u custom back link kullandigi icin native stack header'i
        // status bar alanini bizim icin ayirmiyor. Safe-area top padding,
        // "Back to Deck" metninin saat/operator alaninin altinda kalmasini
        // garanti eder. Bottom padding de gesture bar olan cihazlarda alt
        // cevap butonlarinin ekrana yapismasini engeller.
        paddingBottom: Math.max(insets.bottom, 16),
        paddingTop: insets.top + 16,
      },
    ],
    [colors.background, insets.bottom, insets.top]
  );

  const handleBackToDeck = useCallback(() => {
    router.push(`/deck/${deckId}`);
  }, [deckId, router]);

  const handleAnswer = useCallback(
    (answer: QuizAnswer) => {
      // Cevaba gore farkli haptic feedback verilir. Haptic hata verse bile
      // quiz akisi bozulmasin diye catch ile yutulur.
      if (answer === 'correct') {
        playCorrectHaptic().catch(() => undefined);
      } else {
        playIncorrectHaptic().catch(() => undefined);
      }
      const result = answerCard(answer);

      if (result.isComplete) {
        // Quiz bitince skorlar route param olarak result ekranina gider.
        // Result ekrani parse edip yuzdeyi hesaplar.
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

  const handleShowAnswer = useCallback(() => {
    playLightHaptic().catch(() => undefined);
    showAnswer();
  }, [showAnswer]);

  useEffect(() => {
    // Cevap gorunur/gizli durumuna gore kartin flip progress degeri animate olur.
    flipProgress.value = withTiming(isAnswerVisible ? 1 : 0, {
      duration: 260,
    });
  }, [flipProgress, isAnswerVisible]);

  useEffect(() => {
    // Yeni karta gecince onceki swipe offset'i sifirlanir.
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, [currentCard?.id, translateX, translateY]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Kart saga/sola suruklenirken hafif doner ve opacity azalir.
    const rotate = interpolate(
      translateX.value,
      [-180, 0, 180],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );

    return {
      opacity: interpolate(
        Math.abs(translateX.value),
        [0, 220],
        [1, 0.86],
        Extrapolation.CLAMP
      ),
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const faceAnimatedStyle = useAnimatedStyle(() => ({
    // Onceki surumde ayni kart yuzunu 180 derece donduruyorduk. iOS/Expo Go'da
    // backfaceVisibility ile birlikte bu, cevap acildiginda tum metnin
    // gorunmez kalmasina yol acabiliyor. Burada state degisimini hafif bir
    // scale/opacity gecisiyle hissettiriyoruz; icerik hicbir zaman ters
    // cevrilmedigi icin meaning metni her platformda okunur kalir.
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.96, 1]),
    transform: [
      {
        scale: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.985, 1]),
      },
    ],
  }));

  const swipeGesture = Gesture.Pan()
    // Cevap gorunmeden swipe aktif olmaz; once kullanici cevabi acmali.
    .enabled(isAnswerVisible)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2;
    })
    .onEnd((event) => {
      if (event.translationX > 90) {
        // Saga swipe = kullanici bildi.
        translateX.value = withTiming(360, { duration: 180 });
        runOnJS(handleAnswer)('correct');
        return;
      }

      if (event.translationX < -90) {
        // Sola swipe = tekrar calismali.
        translateX.value = withTiming(-360, { duration: 180 });
        runOnJS(handleAnswer)('incorrect');
        return;
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  if (!deck) {
    // Deck bulunamazsa fallback gosterilir; route param hatasi app'i dusurmez.
    return (
      <View style={screenContainerStyle}>
        <Pressable style={styles.backButton} onPress={handleBackToDeck}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            {t('actions.backToDeck')}
          </Text>
        </Pressable>
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>
          {t('decks.deckNotFound')}
        </Text>
      </View>
    );
  }

  if (!currentCard) {
    // Bos deck icin quiz baslamaz; kullaniciya kart eklemesi soylenir.
    return (
      <View style={screenContainerStyle}>
        <Pressable style={styles.backButton} onPress={handleBackToDeck}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            {t('actions.backToDeck')}
          </Text>
        </Pressable>
        <Text style={[styles.deckTitle, { color: colors.text }]}>
          {deck.title}
        </Text>
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>
          {t('quiz.deckRequired')}
        </Text>
      </View>
    );
  }

  return (
    <View style={screenContainerStyle}>
      <Pressable style={styles.backButton} onPress={handleBackToDeck}>
        <Text style={[styles.backText, { color: colors.primary }]}>
          {t('actions.backToDeck')}
        </Text>
      </Pressable>
      <Text style={[styles.deckTitle, { color: colors.text }]}>
        {deck.title}
      </Text>
      <Text style={[styles.progress, { color: colors.mutedText }]}>
        {t('quiz.progress', {
          current: progressLabel.current,
          total: progressLabel.total,
        })}
      </Text>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreText, { color: colors.subtleText }]}>
          {t('quiz.known')}: {correctCount}
        </Text>
        <Text style={[styles.scoreText, { color: colors.subtleText }]}>
          {t('quiz.practice')}: {incorrectCount}
        </Text>
      </View>
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            styles.card,
            cardAnimatedStyle,
            { backgroundColor: colors.surface, shadowColor: colors.shadow },
          ]}
        >
          {isAnswerVisible && (
            <>
              <View style={styles.practiceBadge}>
                <Text style={styles.overlayLabel}>{t('quiz.practice')}</Text>
              </View>
              <View style={styles.swipeKnownBadge}>
                <Text style={styles.overlayLabel}>{t('quiz.known')}</Text>
              </View>
            </>
          )}
          <Animated.View
            style={[
              styles.cardFace,
              faceAnimatedStyle,
              isAnswerVisible && styles.cardFaceAnswered,
            ]}
          >
            <Text style={[styles.label, { color: colors.mutedTextAlt }]}>
              {t('quiz.word')}
            </Text>
            <Text style={[styles.word, { color: colors.text }]}>
              {currentCard.word}
            </Text>
            {isAnswerVisible ? (
              <>
                <Text style={[styles.label, { color: colors.mutedTextAlt }]}>
                  {t('quiz.meaning')}
                </Text>
                <Text style={[styles.meaning, { color: colors.text }]}>
                  {currentCard.meaning}
                </Text>
                <Text style={[styles.swipeHint, { color: colors.mutedText }]}>
                  {t('quiz.swipeHint')}
                </Text>
              </>
            ) : (
              <Text style={[styles.mutedMeaning, { color: colors.subtleText }]}>
                {t('quiz.flipHint')}
              </Text>
            )}
            <Pressable
              style={styles.primaryButton}
              onPress={handleShowAnswer}
              disabled={isAnswerVisible}
            >
              <Text style={styles.primaryButtonText}>
                {isAnswerVisible ? t('quiz.answerShown') : t('quiz.showAnswer')}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
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
          <Text style={styles.actionLabel}>{t('quiz.needPractice')}</Text>
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
          <Text style={styles.actionLabel}>{t('quiz.known')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
