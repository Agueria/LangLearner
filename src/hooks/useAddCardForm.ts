// Add card formunun tum is kurallari burada tutulur.
// Component sadece inputlari cizer; validation, Gemini cevirisi, cooldown,
// submit ve reset davranislari bu hook icindedir.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Card } from '../constants';
import { isGeminiConfigured } from '../constants/config';
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
    // Modal kapaninca veya kart eklendikten sonra form temizlenir. Cooldown
    // timer'i de iptal edilir ki kapanmis modal arka planda state guncellemesin.
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
      // Component unmount olursa bekleyen timer temizlenir. Bu memory leak ve
      // React "state update on unmounted component" uyarilarini engeller.
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    },
    []
  );

  const validate = useCallback(
    () =>
      // Validation mesajlari i18n'den gelir. Boylece ayni kural seti hem TR
      // hem EN arayuzde dogru metni gosterebilir.
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
    if (!isGeminiConfigured) {
      // Config seviyesinde throw etmek yerine form seviyesinde uyari veriyoruz.
      // Bu sayede uygulama acilir, sadece Gemini'ye bagli ozellik kapali kalir.
      setTranslateError(t('errors.geminiMissing'));
      return;
    }
    if (!trimmedWord) {
      // Bos kelime icin API'ye gitmeyiz; kullaniciya aninda yerel hata gosteririz.
      setTranslateError(t('errors.wordFirst'));
      return;
    }
    if (isCooldown) {
      // Gemini tarafina pes pese istek atmayi azaltmak icin kisa cooldown var.
      return;
    }

    setTranslateError('');
    setIsTranslating(true);
    try {
      // Gemini sadece anlam alanini doldurur. Kullanici isterse sonucu manuel
      // degistirebilir, yani AI cevabi zorunlu dogru kabul edilmez.
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
      // Lokal id Date.now + random ile uretilir. Bu id hem Redux hem Firestore
      // dokuman id'si olarak kullanilir.
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
    // UI component bu boolean'i kullanarak Auto-translate butonunu kapatir ve
    // eksik .env mesajini gosterir. API key'in kendisi component'e verilmez.
    isGeminiConfigured,
    resetForm,
    handleTranslate,
    handleSubmit,
  };
};
