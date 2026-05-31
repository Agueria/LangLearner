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
import { useTranslation } from 'react-i18next';
import { AddCardModal, CardRow, EditCardModal } from '../../src/components';
import { useCards, useDecks, useThemeColors } from '../../src/hooks';
import { COLORS, type Card } from '../../src/constants';

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    elevation: 10,
    justifyContent: 'center',
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
  disabledButton: {
    opacity: 0.5,
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
  footerActions: {
    gap: 10,
    marginBottom: 16,
    marginTop: 24,
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
  quizButton: {
    alignItems: 'center',
    backgroundColor: COLORS.slate,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  quizButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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
  const { t } = useTranslation();
  const colors = useThemeColors();
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
  const handleStartQuiz = useCallback(() => {
    router.push(`/quiz/${deckId}`);
  }, [deckId, router]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Card>) => (
      <CardRow card={item} onPress={() => handleOpenEdit(item)} />
    ),
    [handleOpenEdit]
  );

  if (!deck) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackToDecks}>
            <Text style={[styles.backText, { color: colors.primary }]}>
              {t('actions.backToDecks')}
            </Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('decks.deck')}
          </Text>
        </View>
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>
          {t('decks.deckNotFound')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackToDecks}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            {t('actions.backToDecks')}
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{deck.title}</Text>
      </View>
      <FlatList
        data={deckCards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          deckCards.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        initialNumToRender={10}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>
            {t('decks.emptyCards')}
          </Text>
        }
        maxToRenderPerBatch={10}
        removeClippedSubviews
        windowSize={7}
      />
      <View style={styles.footerActions}>
        <Pressable
          style={[
            styles.quizButton,
            deckCards.length === 0 && styles.disabledButton,
          ]}
          onPress={handleStartQuiz}
          disabled={deckCards.length === 0}
        >
          <Text style={styles.quizButtonText}>{t('decks.startQuiz')}</Text>
        </Pressable>
        <Pressable style={styles.addButton} onPress={handleOpenAdd}>
          <Text style={styles.addButtonText}>{t('decks.addCard')}</Text>
        </Pressable>
      </View>
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
