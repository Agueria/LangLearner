// Single row for a card in the deck detail list.
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Card } from '../constants';

type CardRowProps = {
  card: Card;
  onPress: () => void;
};

export const CardRow = ({ card, onPress }: CardRowProps) => (
  <Pressable style={styles.cardRow} onPress={onPress}>
    <Text style={styles.cardWord}>{card.word}</Text>
    <Text style={styles.cardMeaning}>{card.meaning}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  cardMeaning: {
    fontSize: 14,
    color: '#4E4E4E',
    marginTop: 4,
  },
});
