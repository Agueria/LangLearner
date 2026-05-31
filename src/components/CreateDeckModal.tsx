// Deck olusturma modal'i.
// Baslik validation, opsiyonel aciklama, native image picker ile kapak fotografi
// ve submit sonrasi Redux'a yeni deck yazma islemleri burada yapilir.
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
import { useTranslation } from 'react-i18next';
import { useDecks, useImagePicker, useThemeColors } from '../hooks';
import { COLORS, type Deck } from '../constants';
import { validateDeckForm, type DeckFormErrors } from '../utils/validation';
import { modalStyles } from './modalStyles';

type CreateDeckModalProps = {
  visible: boolean;
  onClose: () => void;
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
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<DeckFormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    // Modal kapandiginda onceki form degerleri ve hata mesajlari temizlenir.
    setTitle('');
    setDescription('');
    setCoverImageUri(null);
    setErrors({});
    setHasSubmitted(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      // Kullanici cancel/backdrop ile kapatirsa modal bir sonraki acilista temiz
      // baslasin diye form resetlenir.
      resetForm();
    }
  }, [resetForm, visible]);

  const validate = useCallback(
    () =>
      // validateDeckForm saf fonksiyondur; burada sadece secili dile gore
      // hata mesajlari enjekte edilir.
      validateDeckForm(title, {
        meaningRequired: t('errors.meaningRequired'),
        titleRequired: t('errors.titleRequired'),
        titleTooLong: t('errors.titleTooLong'),
        wordRequired: t('errors.wordRequired'),
        wordTooLong: t('errors.wordTooLong'),
      }),
    [t, title]
  );

  const handleSelectCover = useCallback(async () => {
    // useImagePicker izin isteme, galeri acma ve hata alertlerini kendi icinde
    // yonetir. Burada sadece donen uri state'e yazilir.
    const selectedUri = await pickImage();

    if (selectedUri) {
      setCoverImageUri(selectedUri);
    }
  }, [pickImage]);

  const handleSubmit = useCallback(() => {
    // Submit'e basildiginda validation calisir. Hata varsa Redux'a veri yazilmaz.
    setHasSubmitted(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const newDeck: Deck = {
      // Deck id local olarak uretilir ve Firestore dokuman id'si olarak da
      // kullanilabilir. Bu sayede local/cloud ayni entity'yi isaret eder.
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
        style={[modalStyles.sheet, { backgroundColor: colors.surface }]}
      >
        <Text style={[modalStyles.title, styles.title, { color: colors.text }]}>
          {t('decks.newDeck')}
        </Text>
        <View style={modalStyles.fieldGroup}>
          <Text style={[modalStyles.label, { color: colors.text }]}>
            {t('decks.coverPhoto')}
          </Text>
          <Pressable
            style={[
              styles.coverPressable,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
            onPress={handleSelectCover}
          >
            {coverImageUri ? (
              // Kapak fotografi secildiyse preview gosterilir.
              <Image
                source={{ uri: coverImageUri }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              // Fotograf yoksa kamera benzeri placeholder gosterilir.
              <View style={styles.coverPlaceholder}>
                <View style={styles.cameraIcon}>
                  <View style={styles.cameraTop} />
                  <View style={styles.cameraBody}>
                    <View style={styles.cameraLens} />
                  </View>
                </View>
                <Text style={styles.coverPlaceholderText}>
                  {t('decks.addPhoto')}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={modalStyles.fieldGroup}>
          <Text style={[modalStyles.label, { color: colors.text }]}>
            {t('decks.titleLabel')}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('decks.titlePlaceholder')}
            maxLength={50}
            style={[
              modalStyles.input,
              { borderColor: colors.borderLight, color: colors.text },
            ]}
            placeholderTextColor={colors.mutedText}
          />
          {hasSubmitted && errors.title && (
            <Text style={modalStyles.errorText}>{errors.title}</Text>
          )}
        </View>
        <View style={modalStyles.fieldGroup}>
          <Text style={[modalStyles.label, { color: colors.text }]}>
            {t('decks.description')}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('decks.descriptionPlaceholder')}
            style={[
              modalStyles.input,
              { borderColor: colors.borderLight, color: colors.text },
            ]}
            placeholderTextColor={colors.mutedText}
          />
        </View>
        <View style={[modalStyles.actions, styles.actions]}>
          <Pressable style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={[modalStyles.cancelText, { color: colors.subtleText }]}>
              {t('actions.cancel')}
            </Text>
          </Pressable>
          <Pressable style={modalStyles.submitButton} onPress={handleSubmit}>
            <Text style={modalStyles.submitText}>{t('actions.create')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
