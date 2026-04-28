import { useCallback, useMemo, useState } from 'react';
import type { Card } from '../constants';

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
  progressLabel: string;
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

  const progressLabel = useMemo(() => {
    if (totalCount === 0) {
      return 'No cards';
    }

    return `Card ${currentIndex + 1} of ${totalCount}`;
  }, [currentIndex, totalCount]);

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
