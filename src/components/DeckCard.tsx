// Card UI for a single deck in the list.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Deck } from '../constants';

type DeckCardProps = {
  deck: Deck;
  onPress: () => void;
};

export const DeckCard = ({ deck, onPress }: DeckCardProps) => {
  const initial = deck.title.trim().charAt(0).toUpperCase();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {deck.coverImage ? (
        <Image source={{ uri: deck.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{initial || '?'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{deck.title}</Text>
        {deck.description.length > 0 && (
          <Text style={styles.description}>{deck.description}</Text>
        )}
        <Text style={styles.meta}>{deck.cardCount} cards</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  coverImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E9EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F6FEB',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#4E4E4E',
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: '#6B6B6B',
  },
});
