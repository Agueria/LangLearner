// Deck detail screen: shows cards and allows adding new ones.
import { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { AddCardModal, CardRow, EditCardModal } from '../../src/components';
import { useCards, useDecks } from '../../src/hooks';
import { COLORS, type Card } from '../../src/constants';

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    elevation: 10,
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    zIndex: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.mutedText,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 56,
  },
  listContainer: {
    paddingBottom: 96,
  },
  title: {
    alignSelf: 'flex-end',
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
  },
});

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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Card>) => (
      <CardRow card={item} onPress={() => handleOpenEdit(item)} />
    ),
    [handleOpenEdit]
  );

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
        renderItem={renderItem}
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

