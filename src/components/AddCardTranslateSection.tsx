// Meaning input with auto-translate action.
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS } from '../constants';
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
  return (
    <View style={modalStyles.fieldGroup}>
      <View style={styles.row}>
        <Text style={modalStyles.label}>Meaning *</Text>
        <Pressable
          style={styles.translateButton}
          onPress={onTranslate}
          disabled={isTranslating || isCooldown}
        >
          {isTranslating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.translateText}>Auto-translate</Text>
          )}
        </Pressable>
      </View>
      <TextInput
        value={meaning}
        onChangeText={onMeaningChange}
        placeholder="e.g. merhaba"
        style={modalStyles.input}
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
