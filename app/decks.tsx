// Decks tab: list decks and create demo decks/cards for now.
import { useCallback, useLayoutEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Card, Deck } from '../src/constants';
import { useCards, useDecks } from '../src/hooks';

export default function DecksScreen() {
  const navigation = useNavigation();
  const { decks, addDeck, updateDeck } = useDecks();
  const { addCard } = useCards();
  const [isDeckPickerOpen, setIsDeckPickerOpen] = useState(false);

  // Simple client-side id generator for demo data.
  const createId = useCallback(
    () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // Create a new deck and seed it with a first card.
  const handleCreateDeck = useCallback(() => {
    const createdAt = new Date().toISOString();
    const deckId = createId();

    const newDeck: Deck = {
      id: deckId,
      title: `Deck ${decks.length + 1}`,
      description: 'New deck',
      createdAt,
      cardCount: 1,
    };

    const newCard: Card = {
      id: createId(),
      deckId,
      word: 'hello',
      meaning: 'merhaba',
      createdAt,
    };

    addDeck(newDeck);
    addCard(newCard);
  }, [addCard, addDeck, createId, decks.length]);

  // Open a deck picker so the user can choose a target deck.
  const handleAddCard = useCallback(() => {
    if (decks.length === 0) {
      Alert.alert('No decks', 'Create a deck first.');
      return;
    }
    setIsDeckPickerOpen(true);
  }, [decks.length]);

  // Add a demo card and bump the selected deck count.
  const handleAddCardToDeck = useCallback(
    (targetDeck: Deck) => {
      const createdAt = new Date().toISOString();
      const newCard: Card = {
        id: createId(),
        deckId: targetDeck.id,
        word: `Word ${targetDeck.cardCount + 1}`,
        meaning: 'Meaning',
        createdAt,
      };

      addCard(newCard);
      updateDeck({
        ...targetDeck,
        cardCount: targetDeck.cardCount + 1,
      });
      setIsDeckPickerOpen(false);
    },
    [addCard, createId, updateDeck]
  );

  const handleAdd = useCallback(() => {
    Alert.alert('Add', 'What do you want to create?', [
      { text: 'Create Deck', onPress: handleCreateDeck },
      { text: 'Add Card', onPress: handleAddCard },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleAddCard, handleCreateDeck]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      ),
    });
  }, [handleAdd, navigation]);

  return (
    <View style={styles.container}>
      {/* Deck picker modal for Add Card flow. */}
      <Modal
        animationType="slide"
        transparent
        visible={isDeckPickerOpen}
        onRequestClose={() => setIsDeckPickerOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsDeckPickerOpen(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select a deck</Text>
          <ScrollView contentContainerStyle={styles.modalList}>
            {decks.map((deck) => (
              <Pressable
                key={deck.id}
                style={styles.modalItem}
                onPress={() => handleAddCardToDeck(deck)}
              >
                <View>
                  <Text style={styles.modalItemTitle}>{deck.title}</Text>
                  <Text style={styles.modalItemMeta}>{deck.cardCount} cards</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setIsDeckPickerOpen(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          decks.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        renderItem={({ item }: { item: Deck }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.description}</Text>
            <Text style={styles.cardMeta}>{item.cardCount} cards</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No decks yet</Text>}
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
  listContainer: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#5B5B5B',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: '#4E4E4E',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F6FEB',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 12,
  },
  modalList: {
    paddingBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  modalItemMeta: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  modalCloseButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#1F6FEB',
    fontWeight: '600',
  },
});
