// Meaning input with auto-translate action.
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

export const AddCardTranslateSection = ({
  meaning,
  onMeaningChange,
  onTranslate,
  translateError,
  meaningError,
  isTranslating,
  isCooldown,
}: AddCardTranslateSectionProps) => (
  <View style={modalStyles.fieldGroup}>
    <View style={styles.row}>
      <Text style={modalStyles.label}>Meaning *</Text>
      <Pressable
        style={styles.translateButton}
        onPress={onTranslate}
        disabled={isTranslating || isCooldown}
      >
        {isTranslating ? (
          <ActivityIndicator size="small" color="#1F6FEB" />
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
    {meaningError && <Text style={modalStyles.errorText}>{meaningError}</Text>}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  translateButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#E9EEF9',
  },
  translateText: {
    fontSize: 12,
    color: '#1F6FEB',
    fontWeight: '600',
  },
});
