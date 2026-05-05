// Single row for a card in the deck detail list.
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, type Card } from '../constants';
import { useThemeColors } from '../hooks';

type CardRowProps = {
  card: Card;
  onPress: () => void;
};

const styles = StyleSheet.create({
  cardMeaning: {
    color: COLORS.subtleText,
    fontSize: 14,
    marginTop: 4,
  },
  cardRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
  },
  cardWord: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export function CardRow({ card, onPress }: CardRowProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      style={[styles.cardRow, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <Text style={[styles.cardWord, { color: colors.text }]}>{card.word}</Text>
      <Text style={[styles.cardMeaning, { color: colors.subtleText }]}>
        {card.meaning}
      </Text>
    </Pressable>
  );
}
