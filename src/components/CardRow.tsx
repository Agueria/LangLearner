// Single row for a card in the deck detail list.
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, type Card } from '../constants';

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
  return (
    <Pressable style={styles.cardRow} onPress={onPress}>
      <Text style={styles.cardWord}>{card.word}</Text>
      <Text style={styles.cardMeaning}>{card.meaning}</Text>
    </Pressable>
  );
}
