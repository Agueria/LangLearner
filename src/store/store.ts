import { configureStore } from '@reduxjs/toolkit';
import deckReducer from './slices/deckSlice';
import cardReducer from './slices/cardSlice';

export const store = configureStore({
  reducer: {
    decks: deckReducer,
    cards: cardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
