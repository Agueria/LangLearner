// Modal form for creating a new deck.
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
import { useDecks } from '../hooks';
import type { Deck } from '../constants';
import { modalStyles } from './modalStyles';

type CreateDeckModalProps = {
  visible: boolean;
  onClose: () => void;
};

type FormErrors = {
  title?: string;
};

export const CreateDeckModal = ({
  visible,
  onClose,
}: CreateDeckModalProps) => {
  const { addDeck } = useDecks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
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
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      nextErrors.title = 'Title is required.';
    } else if (trimmedTitle.length > 50) {
      nextErrors.title = 'Title must be 50 characters or fewer.';
    }

    return nextErrors;
  }, [title]);

  const handleSubmit = useCallback(() => {
    setHasSubmitted(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const newDeck: Deck = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      cardCount: 0,
    };

    addDeck(newDeck);
    onClose();
    resetForm();
  }, [addDeck, description, onClose, resetForm, title, validate]);

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
        <Text style={[modalStyles.title, styles.title]}>New Deck</Text>
        <View style={modalStyles.fieldGroup}>
          <Text style={modalStyles.label}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Travel Vocabulary"
            maxLength={50}
            style={modalStyles.input}
          />
          {hasSubmitted && errors.title && (
            <Text style={modalStyles.errorText}>{errors.title}</Text>
          )}
        </View>
        <View style={modalStyles.fieldGroup}>
          <Text style={modalStyles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional"
            style={modalStyles.input}
          />
        </View>
        <View style={[modalStyles.actions, styles.actions]}>
          <Pressable style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={modalStyles.submitButton} onPress={handleSubmit}>
            <Text style={modalStyles.submitText}>Create</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  actions: {
    marginBottom: 16,
  },
});
