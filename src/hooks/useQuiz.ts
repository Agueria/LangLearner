import { useCallback, useMemo, useState } from 'react';
import type { Card } from '../constants';

// Quiz hook'u UI'den bagimsiz sinav state'ini yonetir.
// Ekran animasyon/gesture/haptic ile ilgilenir; bu hook sadece hangi karttayiz,
// cevap gorundu mu ve skor ne durumda sorularini cevaplar.
export type QuizAnswer = 'correct' | 'incorrect';

export type QuizResult = {
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
};

type UseQuizResult = {
  currentCard: Card | null;
  currentIndex: number;
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  isAnswerVisible: boolean;
  progressLabel: {
    current: number;
    total: number;
  };
  answerCard: (answer: QuizAnswer) => QuizResult & { isComplete: boolean };
  resetQuiz: () => void;
  showAnswer: () => void;
};

export const useQuiz = (cards: Card[]): UseQuizResult => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const totalCount = cards.length;
  const currentCard = cards[currentIndex] ?? null;

  const progressLabel = useMemo(
    () => ({
      // Bos deck durumunda "Card 1 of 0" gibi yanlis bir progress yazmamak
      // icin current degeri 0'a cekilir.
      current: totalCount === 0 ? 0 : currentIndex + 1,
      total: totalCount,
    }),
    [currentIndex, totalCount]
  );

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsAnswerVisible(false);
  }, []);

  const showAnswer = useCallback(() => {
    setIsAnswerVisible(true);
  }, []);

  const answerCard = useCallback(
    (answer: QuizAnswer) => {
      // setState async oldugu icin sonuc ekranina gidecek skor degerlerini
      // once lokal degiskenlerde hesapliyoruz, sonra state'i guncelliyoruz.
      const nextCorrectCount =
        answer === 'correct' ? correctCount + 1 : correctCount;
      const nextIncorrectCount =
        answer === 'incorrect' ? incorrectCount + 1 : incorrectCount;
      const isComplete = currentIndex >= totalCount - 1;
      const result = {
        correctCount: nextCorrectCount,
        incorrectCount: nextIncorrectCount,
        totalCount,
        isComplete,
      };

      setCorrectCount(nextCorrectCount);
      setIncorrectCount(nextIncorrectCount);

      if (!isComplete) {
        // Quiz bitmediyse bir sonraki karta gecilir ve cevap tekrar gizlenir.
        setCurrentIndex((index) => index + 1);
        setIsAnswerVisible(false);
      }

      return result;
    },
    [correctCount, currentIndex, incorrectCount, totalCount]
  );

  return {
    currentCard,
    currentIndex,
    totalCount,
    correctCount,
    incorrectCount,
    isAnswerVisible,
    progressLabel,
    answerCard,
    resetQuiz,
    showAnswer,
  };
};
