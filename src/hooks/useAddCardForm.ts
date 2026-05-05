// Form logic for adding cards with auto-translation.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Card } from '../constants';
import { translateWord } from '../services/translationService';
import { validateCardForm, type CardFormErrors } from '../utils/validation';
import { useCards } from './useCards';

type UseAddCardFormArgs = {
  deckId: string;
  onClose: () => void;
};

export const useAddCardForm = ({ deckId, onClose }: UseAddCardFormArgs) => {
  const { addCard } = useCards();
  const { t } = useTranslation();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [errors, setErrors] = useState<CardFormErrors>({});
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

  const validate = useCallback(
    () =>
      validateCardForm(word, meaning, {
        meaningRequired: t('errors.meaningRequired'),
        titleRequired: t('errors.titleRequired'),
        titleTooLong: t('errors.titleTooLong'),
        wordRequired: t('errors.wordRequired'),
        wordTooLong: t('errors.wordTooLong'),
      }),
    [meaning, t, word]
  );

  const handleTranslate = useCallback(async () => {
    const trimmedWord = word.trim();
    if (!trimmedWord) {
      setTranslateError(t('errors.wordFirst'));
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
        setTranslateError(t('errors.translationFailed'));
      }
    } finally {
      setIsTranslating(false);
      setIsCooldown(true);
      cooldownTimerRef.current = setTimeout(() => {
        setIsCooldown(false);
        cooldownTimerRef.current = null;
      }, 1500);
    }
  }, [isCooldown, t, word]);

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
