// Modal form for adding a card to a deck.
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
import { useCards } from '../hooks';
import type { Card } from '../constants';
import { modalStyles } from './modalStyles';

type AddCardModalProps = {
  visible: boolean;
  deckId: string;
  onClose: () => void;
};

type FormErrors = {
  word?: string;
  meaning?: string;
};

export const AddCardModal = ({
  visible,
  deckId,
  onClose,
}: AddCardModalProps) => {
  const { addCard } = useCards();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    setWord('');
    setMeaning('');
    setErrors({});
    setHasSubmitted(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [resetForm, visible]);

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
          />
          {hasSubmitted && errors.word && (
            <Text style={modalStyles.errorText}>{errors.word}</Text>
          )}
        </View>
        <View style={modalStyles.fieldGroup}>
          <Text style={modalStyles.label}>Meaning *</Text>
          <TextInput
            value={meaning}
            onChangeText={setMeaning}
            placeholder="e.g. merhaba"
            style={modalStyles.input}
          />
          {hasSubmitted && errors.meaning && (
            <Text style={modalStyles.errorText}>{errors.meaning}</Text>
          )}
        </View>
        <View style={[modalStyles.actions, styles.actions]}>
          <Pressable style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={modalStyles.submitButton} onPress={handleSubmit}>
            <Text style={modalStyles.submitText}>Add</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actions: {
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
});
