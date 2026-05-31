// Card slice, her kelime kartinin local kopyasini tutar.
// Kartlar deckId ile bir desteye baglanir; bu id hem listede filtreleme hem
// Firestore subcollection path'i icin kullanilir.
import { createSlice, PayloadAction, type UnknownAction } from '@reduxjs/toolkit';
import type { Card } from '../../constants/types';

type RemoveCardPayload = {
  cardId: string;
  deckId: string;
};

const initialState: Card[] = [];

const isRemoveDeckAction = (
  action: UnknownAction
): action is PayloadAction<string> => action.type === 'decks/removeDeck';

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    addCard(state, action: PayloadAction<Card>) {
      // Kart ekleme once local Redux'a yazilir. Kullanici offline ise bile
      // karti hemen gorur; cloud tarafina gitme isi sync queue'dadir.
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
    // Bir deck silinince o deck'e ait butun kartlari da local state'ten
    // temizliyoruz. Bu parent-child veri tutarliligini korur.
    builder.addMatcher(
      isRemoveDeckAction,
      (state, action) =>
        state.filter((card) => card.deckId !== action.payload)
    );
  },
});

export const { addCard, removeCard, updateCard } = cardSlice.actions;
export default cardSlice.reducer;
