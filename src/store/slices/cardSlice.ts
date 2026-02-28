// Redux slice for managing card state.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Card } from '../../constants/types';

const initialState: Card[] = [];

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    addCard(state, action: PayloadAction<Card>) {
      state.push(action.payload);
    },
    removeCard(state, action: PayloadAction<string>) {
      return state.filter((card) => card.id !== action.payload);
    },
    updateCard(state, action: PayloadAction<Card>) {
      const index = state.findIndex((card) => card.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addCard, removeCard, updateCard } = cardSlice.actions;
export default cardSlice.reducer;
