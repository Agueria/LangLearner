// Modal form for adding a card to a deck.
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
import { modalStyles } from './modalStyles';
import { AddCardTranslateSection } from './AddCardTranslateSection';
import { useAddCardForm } from '../hooks/useAddCardForm';

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
  const {
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
  } = useAddCardForm({ deckId, onClose });
  useEffect(() => {
    if (!visible) {
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
        style={modalStyles.sheet}
      >
        <Text style={modalStyles.title}>Add Card</Text>
        <View style={modalStyles.fieldGroup}>
          <Text style={modalStyles.label}>Word *</Text>
          <TextInput
            value={word}
            onChangeText={setWord}
            placeholder="e.g. hello"
            maxLength={100}
            style={modalStyles.input}
            editable={!isTranslating}
          />
          {hasSubmitted && errors.word && (
            <Text style={modalStyles.errorText}>{errors.word}</Text>
          )}
        </View>
        <AddCardTranslateSection
          meaning={meaning}
          onMeaningChange={setMeaning}
          onTranslate={handleTranslate}
          translateError={translateError}
          meaningError={hasSubmitted ? errors.meaning : undefined}
          isTranslating={isTranslating}
          isCooldown={isCooldown}
        />
        <View style={[modalStyles.actions, styles.actions]}>
          <Pressable
            style={modalStyles.cancelButton}
            onPress={onClose}
            disabled={isTranslating}
          >
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={modalStyles.submitButton}
            onPress={handleSubmit}
            disabled={isTranslating || isCooldown}
          >
            <Text style={modalStyles.submitText}>Add</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
