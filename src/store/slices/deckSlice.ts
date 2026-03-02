// Redux slice for managing deck state.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Deck } from '../../constants/types';
import { addCard, removeCard } from './cardSlice';

const initialState: Deck[] = [];

const deckSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    addDeck(state, action: PayloadAction<Deck>) {
      state.push(action.payload);
    },
    removeDeck(state, action: PayloadAction<string>) {
      return state.filter((deck) => deck.id !== action.payload);
    },
    updateDeck(state, action: PayloadAction<Deck>) {
      const index = state.findIndex((deck) => deck.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addCard, (state, action) => {
      const target = state.find((deck) => deck.id === action.payload.deckId);
      if (target) {
        target.cardCount += 1;
      }
    });
    builder.addCase(removeCard, (state, action) => {
      const target = state.find((deck) => deck.id === action.payload.deckId);
      if (target && target.cardCount > 0) {
        target.cardCount -= 1;
      }
    });
  },
});

export const { addDeck, removeDeck, updateDeck } = deckSlice.actions;
export default deckSlice.reducer;
