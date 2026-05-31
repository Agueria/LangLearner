import cardReducer, {
  addCard,
  removeCard,
} from '../src/store/slices/cardSlice';
import deckReducer, {
  addDeck,
  removeDeck,
} from '../src/store/slices/deckSlice';
import settingsReducer, {
  setDailyReminderEnabled,
  setLanguage,
  setTheme,
} from '../src/store/slices/settingsSlice';
import syncReducer, {
  enqueueSyncOperation,
} from '../src/store/slices/syncSlice';
import type { Card, Deck } from '../src/constants/types';

const deck: Deck = {
  cardCount: 0,
  createdAt: '2026-05-05T00:00:00.000Z',
  description: '',
  id: 'deck-1',
  title: 'Travel',
};

const card: Card = {
  createdAt: '2026-05-05T00:00:00.000Z',
  deckId: 'deck-1',
  id: 'card-1',
  meaning: 'merhaba',
  word: 'hello',
};

describe('redux reducers', () => {
  it('increments deck card count when a card is added', () => {
    const withDeck = deckReducer([], addDeck(deck));
    const nextState = deckReducer(withDeck, addCard(card));

    expect(nextState[0].cardCount).toBe(1);
  });

  it('removes cards when their deck is removed', () => {
    const withCard = cardReducer([], addCard(card));
    const nextState = cardReducer(withCard, removeDeck('deck-1'));

    expect(nextState).toEqual([]);
  });

  it('decrements deck card count when a card is removed', () => {
    const withDeck = deckReducer([{ ...deck, cardCount: 1 }], {
      payload: { cardId: 'card-1', deckId: 'deck-1' },
      type: removeCard.type,
    });

    expect(withDeck[0].cardCount).toBe(0);
  });

  it('updates local settings', () => {
    const withLanguage = settingsReducer(undefined, setLanguage('tr'));
    const withReminder = settingsReducer(
      withLanguage,
      setDailyReminderEnabled(true)
    );
    const withTheme = settingsReducer(withReminder, setTheme('dark'));

    expect(withTheme).toEqual({
      dailyReminderEnabled: true,
      language: 'tr',
      theme: 'dark',
    });
  });

  it('keeps only the latest queued upsert for the same deck', () => {
    const firstState = syncReducer(
      undefined,
      enqueueSyncOperation({ deck, id: 'op-1', type: 'upsertDeck' })
    );
    const nextState = syncReducer(
      firstState,
      enqueueSyncOperation({
        deck: { ...deck, title: 'Updated' },
        id: 'op-2',
        type: 'upsertDeck',
      })
    );

    expect(nextState.queue).toEqual([
      {
        deck: { ...deck, title: 'Updated' },
        id: 'op-2',
        type: 'upsertDeck',
      },
    ]);
  });

  it('keeps card deletions before a queued deck deletion', () => {
    const withCardDelete = syncReducer(
      undefined,
      enqueueSyncOperation({
        cardId: 'card-1',
        deckId: 'deck-1',
        id: 'op-1',
        type: 'deleteCard',
      })
    );
    const nextState = syncReducer(
      withCardDelete,
      enqueueSyncOperation({
        deckId: 'deck-1',
        id: 'op-2',
        type: 'deleteDeck',
      })
    );

    expect(nextState.queue.map((operation) => operation.type)).toEqual([
      'deleteCard',
      'deleteDeck',
    ]);
  });
});
