// Decks tab: kullanicinin kelime destelerini listeler.
// Burada FlatList performans ayarlari, swipe-to-delete gesture'i ve yeni deck
// modalinin acilip kapanmasi yonetilir.
import { memo, useCallback, useLayoutEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTranslation } from 'react-i18next';
import { COLORS, type Deck } from '../../src/constants';
import { CreateDeckModal, DeckCard } from '../../src/components';
import { useDecks, useThemeColors } from '../../src/hooks';

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
  // Header butonu useLayoutEffect ile navigation bar'a yerlestirilir.
  return (
    <Pressable style={styles.addButton} onPress={onPress}>
      <Text style={styles.addButtonText}>+</Text>
    </Pressable>
  );
}

function EmptyDeckList() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Text style={[styles.emptyText, { color: colors.mutedText }]}>
      {t('decks.empty')}
    </Text>
  );
}

const DeckListItem = memo(({
  deck,
  onDelete,
  onPress,
}: DeckListItemProps) => {
  const { t } = useTranslation();
  const handleDelete = useCallback(() => {
    onDelete(deck.id);
  }, [deck.id, onDelete]);

  const renderRightActions = useCallback(
    () => (
      // Swipe saga/sola acilinca gorunen delete aksiyonu.
      <Pressable style={styles.deleteAction} onPress={handleDelete}>
        <Text style={styles.deleteText}>{t('actions.delete')}</Text>
      </Pressable>
    ),
    [handleDelete, t],
  );

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
      <DeckCard deck={deck} onPress={() => onPress(deck.id)} />
    </Swipeable>
  );
});

export default function DecksScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation();
  const { decks, removeDeck } = useDecks();
  const colors = useThemeColors();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreate = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleOpenDeck = useCallback(
    (deckId: string) => {
      // Dynamic route: app/deck/[id].tsx ekranina secilen deck id'si gider.
      router.push(`/deck/${deckId}`);
    },
    [router],
  );

  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      // Yanlislikla swipe ile veri kaybi olmasin diye silmeden once onay alinir.
      Alert.alert(t('actions.delete'), t('decks.deck'), [
        { text: t('actions.cancel'), style: 'cancel' },
        {
          text: t('actions.delete'),
          style: 'destructive',
          onPress: () => removeDeck(deckId),
        },
      ]);
    },
    [removeDeck, t],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Deck>) => (
      <DeckListItem deck={item} onDelete={handleDeleteDeck} onPress={handleOpenDeck} />
    ),
    [handleDeleteDeck, handleOpenDeck],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <HeaderAddButton onPress={handleOpenCreate} />,
    });
  }, [handleOpenCreate, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CreateDeckModal visible={isCreateModalOpen} onClose={handleCloseCreate} />
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={decks.length === 0 ? styles.emptyContainer : styles.listContainer}
        initialNumToRender={8}
        // FlatList ayarlari buyuk deck listelerinde ilk render ve scroll
        // performansini korumak icin eklendi.
        renderItem={renderItem}
        ListEmptyComponent={EmptyDeckList}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        windowSize={7}
      />
    </View>
  );
}
