// Decks tab: list decks and create new ones.
import { useCallback, useLayoutEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { COLORS, type Deck } from '../../src/constants';
import { CreateDeckModal, DeckCard } from '../../src/components';
import { useDecks } from '../../src/hooks';

type DeckListItemProps = {
  deck: Deck;
  onDelete: (deckId: string) => void;
  onPress: (deckId: string) => void;
};
const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    width: 32,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: 16,
  },
  deleteAction: {
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 14,
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  deleteText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    color: COLORS.mutedText,
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 24,
  },
});

type HeaderAddButtonProps = {
  onPress: () => void;
};

function HeaderAddButton({ onPress }: HeaderAddButtonProps) {
  return (
    <Pressable style={styles.addButton} onPress={onPress}>
      <Text style={styles.addButtonText}>+</Text>
    </Pressable>
  );
}

function EmptyDeckList() {
  return (
    <Text style={styles.emptyText}>No decks yet. Tap + to create one.</Text>
  );
}

function DeckListItem({ deck, onDelete, onPress }: DeckListItemProps) {
  const handleDelete = useCallback(() => {
    onDelete(deck.id);
  }, [deck.id, onDelete]);

  const renderRightActions = useCallback(
    () => (
      <Pressable style={styles.deleteAction} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    ),
    [handleDelete]
  );

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
      <DeckCard deck={deck} onPress={() => onPress(deck.id)} />
    </Swipeable>
  );
}

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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Deck>) => (
      <DeckListItem
        deck={item}
        onDelete={handleDeleteDeck}
        onPress={handleOpenDeck}
      />
    ),
    [handleDeleteDeck, handleOpenDeck]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <HeaderAddButton onPress={handleOpenCreate} />,
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
        renderItem={renderItem}
        ListEmptyComponent={EmptyDeckList}
      />
    </View>
  );
}
