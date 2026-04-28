// Redux slice for managing deck state.
import { createSlice, PayloadAction, type UnknownAction } from '@reduxjs/toolkit';
import type { Card, Deck } from '../../constants/types';

type RemoveCardPayload = {
  cardId: string;
  deckId: string;
};

const initialState: Deck[] = [];

const isAddCardAction = (action: UnknownAction): action is PayloadAction<Card> =>
  action.type === 'cards/addCard';

const isRemoveCardAction = (
  action: UnknownAction
): action is PayloadAction<RemoveCardPayload> =>
  action.type === 'cards/removeCard';

const deckSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    addDeck(state, action: PayloadAction<Deck>) {
      return [...state, action.payload];
    },
    removeDeck(state, action: PayloadAction<string>) {
      return state.filter((deck) => deck.id !== action.payload);
    },
    updateDeck(state, action: PayloadAction<Deck>) {
      return state.map((deck) =>
        deck.id === action.payload.id ? action.payload : deck
      );
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAddCardAction,
      (state, action) =>
        state.map((deck) =>
          deck.id === action.payload.deckId
            ? { ...deck, cardCount: deck.cardCount + 1 }
            : deck
        )
    );
    builder.addMatcher(
      isRemoveCardAction,
      (state, action) =>
        state.map((deck) =>
          deck.id === action.payload.deckId
            ? { ...deck, cardCount: Math.max(0, deck.cardCount - 1) }
            : deck
        )
    );
  },
});

export const { addDeck, removeDeck, updateDeck } = deckSlice.actions;
export default deckSlice.reducer;
