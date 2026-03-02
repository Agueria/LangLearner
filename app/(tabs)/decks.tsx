// Decks tab: list decks and create new ones.
import { useCallback, useLayoutEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import type { Deck } from '../../src/constants';
import { CreateDeckModal, DeckCard } from '../../src/components';
import { useDecks } from '../../src/hooks';

export default function DecksScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { decks, removeDeck } = useDecks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreate = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleOpenDeck = useCallback(
    (deckId: string) => {
      router.push(`/deck/${deckId}`);
    },
    [router]
  );

  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      removeDeck(deckId);
    },
    [removeDeck]
  );

  const renderRightActions = useCallback(
    (deckId: string) => (
      <Pressable
        style={styles.deleteAction}
        onPress={() => handleDeleteDeck(deckId)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    ),
    [handleDeleteDeck]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.addButton} onPress={handleOpenCreate}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      ),
    });
  }, [handleOpenCreate, navigation]);

  return (
    <View style={styles.container}>
      <CreateDeckModal
        visible={isCreateModalOpen}
        onClose={handleCloseCreate}
      />
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          decks.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        renderItem={({ item }: { item: Deck }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            rightThreshold={40}
          >
            <DeckCard deck={item} onPress={() => handleOpenDeck(item.id)} />
          </Swipeable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No decks yet. Tap + to create one.</Text>
        }
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
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#5B5B5B',
    textAlign: 'center',
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
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D62828',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
