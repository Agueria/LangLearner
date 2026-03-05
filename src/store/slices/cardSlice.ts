// Redux slice for managing card state.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Card } from '../../constants/types';

type RemoveCardPayload = {
  cardId: string;
  deckId: string;
};

const initialState: Card[] = [];

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    addCard(state, action: PayloadAction<Card>) {
      return [...state, action.payload];
    },
    removeCard(state, action: PayloadAction<RemoveCardPayload>) {
      return state.filter((card) => card.id !== action.payload.cardId);
    },
    updateCard(state, action: PayloadAction<Card>) {
      return state.map((card) =>
        card.id === action.payload.id ? action.payload : card
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      'decks/removeDeck',
      (state, action: PayloadAction<string>) =>
        state.filter((card) => card.deckId !== action.payload)
    );
  },
});

export const { addCard, removeCard, updateCard } = cardSlice.actions;
export default cardSlice.reducer;
