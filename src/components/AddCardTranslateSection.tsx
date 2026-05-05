// Meaning input with auto-translate action.
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { useThemeColors } from '../hooks';
import { modalStyles } from './modalStyles';

type AddCardTranslateSectionProps = {
  meaning: string;
  onMeaningChange: (value: string) => void;
  onTranslate: () => void;
  translateError: string;
  meaningError?: string;
  isTranslating: boolean;
  isCooldown: boolean;
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  translateButton: {
    backgroundColor: COLORS.secondarySurface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  translateText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export function AddCardTranslateSection({
  meaning,
  onMeaningChange,
  onTranslate,
  translateError,
  meaningError = '',
  isTranslating,
  isCooldown,
}: AddCardTranslateSectionProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={modalStyles.fieldGroup}>
      <View style={styles.row}>
        <Text style={[modalStyles.label, { color: colors.text }]}>
          {t('cards.meaningLabel')}
        </Text>
        <Pressable
          style={[
            styles.translateButton,
            { backgroundColor: colors.secondarySurface },
          ]}
          onPress={onTranslate}
          disabled={isTranslating || isCooldown}
        >
          {isTranslating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.translateText, { color: colors.primary }]}>
              {t('actions.autoTranslate')}
            </Text>
          )}
        </Pressable>
      </View>
      <TextInput
        value={meaning}
        onChangeText={onMeaningChange}
        placeholder={t('cards.meaningPlaceholder')}
        style={[
          modalStyles.input,
          { borderColor: colors.borderLight, color: colors.text },
        ]}
        placeholderTextColor={colors.mutedText}
        editable={!isTranslating}
      />
      {translateError.length > 0 && (
        <Text style={modalStyles.errorText}>{translateError}</Text>
      )}
      {meaningError.length > 0 && (
        <Text style={modalStyles.errorText}>{meaningError}</Text>
      )}
    </View>
  );
}

AddCardTranslateSection.defaultProps = {
  meaningError: '',
};
