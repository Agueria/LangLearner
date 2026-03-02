// Modal form for editing an existing card.
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
import type { Card } from '../constants';
import { useCards } from '../hooks';
import { modalStyles } from './modalStyles';

type EditCardModalProps = {
  visible: boolean;
  card: Card | null;
  onClose: () => void;
};

type FormErrors = {
  word?: string;
  meaning?: string;
};

export const EditCardModal = ({
  visible,
  card,
  onClose,
}: EditCardModalProps) => {
  const { updateCard, removeCard } = useCards();
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
      return;
    }
    if (card) {
      setWord(card.word);
      setMeaning(card.meaning);
    }
  }, [card, resetForm, visible]);

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

    if (Object.keys(nextErrors).length > 0 || !card) {
      return;
    }

    updateCard({
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
        style={modalStyles.sheet}
      >
        <Text style={modalStyles.title}>Edit Card</Text>
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
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
          <Pressable style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={modalStyles.submitButton} onPress={handleSubmit}>
            <Text style={modalStyles.submitText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actions: {
    justifyContent: 'center',
    marginBottom: 24,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D62828',
  },
  deleteText: {
    fontSize: 14,
    color: '#D62828',
    fontWeight: '600',
  },
});
