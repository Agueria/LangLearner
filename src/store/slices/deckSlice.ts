// Deck slice, kullanicinin olusturdugu kelime destelerini tutar.
// Reducer'lar immutable mantikla yeni array dondurur; boylece Redux
// degisiklikleri guvenilir sekilde algilar.
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
      // Yeni deste local state'e hemen eklenir. Cloud sync ayri hook'ta
      // queue'ya yazilir, bu yuzden UI internet olmasa bile hizli tepki verir.
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
    // Card slice icindeki add/remove aksiyonlarini dinleyerek deck.cardCount
    // alanini otomatik guncelliyoruz. Boylece kart sayisi tek tek ekranlarda
    // elle hesaplanmak zorunda kalmaz.
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
