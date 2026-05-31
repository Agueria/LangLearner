// Kart ekleme modal'i.
// Input UI bu componentte, asil form state ve Gemini translate akisi
// useAddCardForm hook'unda tutulur.
import { useEffect } from 'react';
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
import { modalStyles } from './modalStyles';
import { AddCardTranslateSection } from './AddCardTranslateSection';
import { useAddCardForm, useThemeColors } from '../hooks';

type AddCardModalProps = {
  visible: boolean;
  deckId: string;
  onClose: () => void;
};

const styles = StyleSheet.create({
  actions: {
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
});

export function AddCardModal({
  visible,
  deckId,
  onClose,
}: AddCardModalProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const {
    word,
    setWord,
    meaning,
    setMeaning,
    errors,
    hasSubmitted,
    isTranslating,
    isCooldown,
    isGeminiConfigured,
    translateError,
    resetForm,
    handleTranslate,
    handleSubmit,
  } = useAddCardForm({ deckId, onClose });
  useEffect(() => {
    if (!visible) {
      // Modal kapaninca hook icindeki form state temizlenir. Bu sayede yeni
      // kart eklerken eski kelime/anlam kalmaz.
      resetForm();
    }
  }, [resetForm, visible]);
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
          {t('cards.addCard')}
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
            editable={!isTranslating}
          />
          {hasSubmitted && errors.word && (
            <Text style={modalStyles.errorText}>{errors.word}</Text>
          )}
        </View>
        {/* Meaning bolumu ayri componenttir; auto-translate butonu ve
            translate error metni orada cizilir. */}
        <AddCardTranslateSection
          meaning={meaning}
          onMeaningChange={setMeaning}
          onTranslate={handleTranslate}
          translateError={translateError}
          meaningError={hasSubmitted ? errors.meaning : undefined}
          isTranslating={isTranslating}
          isCooldown={isCooldown}
          isGeminiConfigured={isGeminiConfigured}
        />
        <View style={[modalStyles.actions, styles.actions]}>
          <Pressable
            style={modalStyles.cancelButton}
            onPress={onClose}
            disabled={isTranslating}
          >
            <Text style={[modalStyles.cancelText, { color: colors.subtleText }]}>
              {t('actions.cancel')}
            </Text>
          </Pressable>
          <Pressable
            style={modalStyles.submitButton}
            onPress={handleSubmit}
            disabled={isTranslating || isCooldown}
          >
            <Text style={modalStyles.submitText}>{t('actions.add')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
