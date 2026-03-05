// Redux slice for managing deck state.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Card, Deck } from '../../constants/types';

const initialState: Deck[] = [];

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
    builder.addCase(
      'cards/addCard',
      (state, action: PayloadAction<Card>) =>
        state.map((deck) =>
          deck.id === action.payload.deckId
            ? { ...deck, cardCount: deck.cardCount + 1 }
            : deck
        )
    );
    builder.addCase(
      'cards/removeCard',
      (state, action: PayloadAction<{ cardId: string; deckId: string }>) =>
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
