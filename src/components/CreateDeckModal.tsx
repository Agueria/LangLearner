// Modal form for creating a new deck.
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDecks, useImagePicker } from '../hooks';
import { COLORS, type Deck } from '../constants';
import { modalStyles } from './modalStyles';

type CreateDeckModalProps = {
  visible: boolean;
  onClose: () => void;
};

type FormErrors = {
  title?: string;
};

const styles = StyleSheet.create({
  actions: {
    marginBottom: 16,
  },
  cameraBody: {
    alignItems: 'center',
    backgroundColor: COLORS.slate,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 44,
  },
  cameraIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    backgroundColor: COLORS.canvas,
    borderColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  cameraTop: {
    backgroundColor: COLORS.slate,
    borderRadius: 3,
    height: 6,
    marginBottom: 4,
    width: 24,
  },
  coverImage: {
    flex: 1,
    width: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    color: COLORS.subtleText,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  coverPressable: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.canvas,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  title: {
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
});

export function CreateDeckModal({
  visible,
  onClose,
}: CreateDeckModalProps) {
  const { addDeck } = useDecks();
  const { pickImage } = useImagePicker();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCoverImageUri(null);
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

  const handleSelectCover = useCallback(async () => {
    const selectedUri = await pickImage();

    if (selectedUri) {
      setCoverImageUri(selectedUri);
    }
  }, [pickImage]);

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
      coverImage: coverImageUri ?? undefined,
      createdAt: new Date().toISOString(),
      cardCount: 0,
    };

    addDeck(newDeck);
    onClose();
    resetForm();
  }, [addDeck, coverImageUri, description, onClose, resetForm, title, validate]);

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
          <Text style={modalStyles.label}>Cover Photo</Text>
          <Pressable
            style={styles.coverPressable}
            onPress={handleSelectCover}
          >
            {coverImageUri ? (
              <Image
                source={{ uri: coverImageUri }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <View style={styles.cameraIcon}>
                  <View style={styles.cameraTop} />
                  <View style={styles.cameraBody}>
                    <View style={styles.cameraLens} />
                  </View>
                </View>
                <Text style={styles.coverPlaceholderText}>
                  Tap to add photo
                </Text>
              </View>
            )}
          </Pressable>
        </View>
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
}
