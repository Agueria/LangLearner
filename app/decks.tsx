import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Deck } from '../src/constants';
import { useDecks } from '../src/hooks/useDecks';

export default function DecksScreen() {
  const navigation = useNavigation();
  const { decks } = useDecks();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.addButton} onPress={() => {}}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
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
});
