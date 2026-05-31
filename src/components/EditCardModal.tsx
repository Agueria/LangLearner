// Kart duzenleme modal'i.
// Secili kartin mevcut word/meaning degerleri local form state'e kopyalanir.
// Kaydet updateCard, sil removeCard aksiyonunu tetikler.
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, type Card } from '../constants';
import { useCards, useThemeColors } from '../hooks';
import { validateCardForm, type CardFormErrors } from '../utils/validation';
import { modalStyles } from './modalStyles';

type EditCardModalProps = {
  visible: boolean;
  card: Card | null;
  onClose: () => void;
};

const styles = StyleSheet.create({
  actions: {
    justifyContent: 'center',
    marginBottom: 24,
  },
  deleteButton: {
    borderColor: COLORS.danger,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});

export function EditCardModal({
  visible,
  card,
  onClose,
}: EditCardModalProps) {
  const { updateCard, removeCard } = useCards();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    // Modal kapandiginda local input ve hata state'i sifirlanir.
    setWord('');
    setMeaning('');
    setErrors({});
    setHasSubmitted(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetForm();
      return;
    }
    if (card) {
      // Modal acildiginda secili kartin degerleri inputlara doldurulur.
      setWord(card.word);
      setMeaning(card.meaning);
    }
  }, [card, resetForm, visible]);

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

  const handleSubmit = useCallback(() => {
    // Validation basarisizsa veya secili card yoksa kayit yapilmaz.
    setHasSubmitted(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !card) {
      return;
    }

    updateCard({
      // Kart id/deckId/createdAt korunur; sadece kullanicinin duzenledigi
      // word ve meaning alanlari trimlenerek guncellenir.
      ...card,
      word: word.trim(),
      meaning: meaning.trim(),
    });
    onClose();
    resetForm();
  }, [card, meaning, onClose, resetForm, updateCard, validate, word]);

  const handleDelete = useCallback(() => {
    if (!card) {
      return;
    }
    // removeCard hem local state'i temizler hem de login varsa deleteCard sync
    // operasyonunu queue'ya ekler.
    removeCard({ cardId: card.id, deckId: card.deckId });
    onClose();
    resetForm();
  }, [card, onClose, removeCard, resetForm]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[modalStyles.sheet, { backgroundColor: colors.surface }]}
      >
        <Text style={[modalStyles.title, { color: colors.text }]}>
          {t('cards.editCard')}
        </Text>
        <View style={modalStyles.fieldGroup}>
          <Text style={[modalStyles.label, { color: colors.text }]}>
            {t('cards.wordLabel')}
          </Text>
          <TextInput
            value={word}
            onChangeText={setWord}
            placeholder={t('cards.wordPlaceholder')}
            maxLength={100}
            style={[
              modalStyles.input,
              { borderColor: colors.borderLight, color: colors.text },
            ]}
            placeholderTextColor={colors.mutedText}
          />
          {hasSubmitted && errors.word && (
            <Text style={modalStyles.errorText}>{errors.word}</Text>
          )}
        </View>
        <View style={modalStyles.fieldGroup}>
          <Text style={[modalStyles.label, { color: colors.text }]}>
            {t('cards.meaningLabel')}
          </Text>
          <TextInput
            value={meaning}
            onChangeText={setMeaning}
            placeholder={t('cards.meaningPlaceholder')}
            style={[
              modalStyles.input,
              { borderColor: colors.borderLight, color: colors.text },
            ]}
            placeholderTextColor={colors.mutedText}
          />
          {hasSubmitted && errors.meaning && (
            <Text style={modalStyles.errorText}>{errors.meaning}</Text>
          )}
        </View>
        <View style={[modalStyles.actions, styles.actions]}>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>{t('actions.delete')}</Text>
          </Pressable>
          <Pressable style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={[modalStyles.cancelText, { color: colors.subtleText }]}>
              {t('actions.cancel')}
            </Text>
          </Pressable>
          <Pressable style={modalStyles.submitButton} onPress={handleSubmit}>
            <Text style={modalStyles.submitText}>{t('actions.save')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
