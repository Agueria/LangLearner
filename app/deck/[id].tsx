// Deck detail screen: shows cards and allows adding new ones.
import { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AddCardModal, CardRow, EditCardModal } from '../../src/components';
import { useCards, useDecks } from '../../src/hooks';
import type { Card } from '../../src/constants';

export default function DeckDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const deckId = typeof id === 'string' ? id : '';
  const { decks } = useDecks();
  const { cards } = useCards();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const deck = useMemo(
    () => decks.find((item) => item.id === deckId),
    [deckId, decks]
  );

  const deckCards = useMemo(
    () => cards.filter((card) => card.deckId === deckId),
    [cards, deckId]
  );
  const handleOpenAdd = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);
  const handleCloseAdd = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);
  const handleOpenEdit = useCallback((card: Card) => {
    setSelectedCard(card);
    setIsEditModalOpen(true);
  }, []);
  const handleCloseEdit = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedCard(null);
  }, []);
  const handleBackToDecks = useCallback(() => {
    router.push('/(tabs)/decks');
  }, [router]);

  if (!deck) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackToDecks}>
            <Text style={styles.backText}>Back to Decks</Text>
          </Pressable>
          <Text style={styles.title}>Deck</Text>
        </View>
        <Text style={styles.emptyText}>Deck not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackToDecks}>
          <Text style={styles.backText}>Back to Decks</Text>
        </Pressable>
        <Text style={styles.title}>{deck.title}</Text>
      </View>
      <FlatList
        data={deckCards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          deckCards.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        renderItem={({ item }: { item: Card }) => (
          <CardRow card={item} onPress={() => handleOpenEdit(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No cards yet. Tap Add Card to create one.
          </Text>
        }
      />
      <Pressable style={styles.addButton} onPress={handleOpenAdd}>
        <Text style={styles.addButtonText}>Add Card</Text>
      </Pressable>
      <AddCardModal
        visible={isAddModalOpen}
        deckId={deckId}
        onClose={handleCloseAdd}
      />
      <EditCardModal
        visible={isEditModalOpen}
        card={selectedCard}
        onClose={handleCloseEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F2',
    padding: 16,
  },
  header: {
    marginTop: 56,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F1F1F',
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  backText: {
    fontSize: 14,
    color: '#1F6FEB',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 96,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#5B5B5B',
    textAlign: 'center',
  },
  addButton: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 32,
    backgroundColor: '#1F6FEB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#1F6FEB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
