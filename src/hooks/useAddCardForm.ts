// Form logic for adding cards with auto-translation.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Card } from '../constants';
import { translateWord } from '../services/translationService';
import { useCards } from './useCards';

type FormErrors = {
  word?: string;
  meaning?: string;
};

type UseAddCardFormArgs = {
  deckId: string;
  onClose: () => void;
};

export const useAddCardForm = ({ deckId, onClose }: UseAddCardFormArgs) => {
  const { addCard } = useCards();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetForm = useCallback(() => {
    setWord('');
    setMeaning('');
    setErrors({});
    setHasSubmitted(false);
    setTranslateError('');
    setIsTranslating(false);
    setIsCooldown(false);
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    },
    []
  );

  const validate = useCallback((): FormErrors => {
    const nextErrors: FormErrors = {};
    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();

    if (trimmedWord.length === 0) {
      nextErrors.word = 'Word is required.';
    } else if (trimmedWord.length > 100) {
      nextErrors.word = 'Word must be 100 characters or fewer.';
    }

    if (trimmedMeaning.length === 0) {
      nextErrors.meaning = 'Meaning is required.';
    }

    return nextErrors;
  }, [meaning, word]);

  const handleTranslate = useCallback(async () => {
    const trimmedWord = word.trim();
    if (!trimmedWord) {
      setTranslateError('Enter a word first');
      return;
    }
    if (isCooldown) {
      return;
    }

    setTranslateError('');
    setIsTranslating(true);
    try {
      const translated = await translateWord(trimmedWord, 'TR');
      setMeaning(translated);
    } catch (error) {
      if (error instanceof Error) {
        setTranslateError(error.message);
      } else {
        setTranslateError('Translation failed');
      }
    } finally {
      setIsTranslating(false);
      setIsCooldown(true);
      cooldownTimerRef.current = setTimeout(() => {
        setIsCooldown(false);
        cooldownTimerRef.current = null;
      }, 1500);
    }
  }, [isCooldown, word]);

  const handleSubmit = useCallback(() => {
    setHasSubmitted(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const newCard: Card = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      deckId,
      word: word.trim(),
      meaning: meaning.trim(),
      createdAt: new Date().toISOString(),
    };

    addCard(newCard);
    onClose();
    resetForm();
  }, [addCard, deckId, meaning, onClose, resetForm, validate, word]);

  return {
    word,
    setWord,
    meaning,
    setMeaning,
    errors,
    hasSubmitted,
    isTranslating,
    isCooldown,
    translateError,
    resetForm,
    handleTranslate,
    handleSubmit,
  };
};
