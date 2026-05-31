import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Deck } from '../constants/types';
import type { AppDispatch, RootState } from '../store/store';
import { addDeck, removeDeck, updateDeck } from '../store/slices/deckSlice';
import { enqueueSyncOperation } from '../store/slices/syncSlice';

const createOperationId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// useDecks, ekranlarin deck state ve sync detaylarini bilmeden calismasini
// saglayan facade hook'tur. Ekran sadece add/remove/update cagirir; hook hem
// Redux'a yazar hem de login varsa cloud sync queue'ya operasyon ekler.
export const useDecks = () => {
  const decks = useSelector((state: RootState) => state.decks);
  const cards = useSelector((state: RootState) => state.cards);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddDeck = useCallback(
    (deck: Deck) => {
      dispatch(addDeck(deck));
      // Auth yokken veri sadece local kalir. Auth varken ayni degisiklik
      // Firestore'a gonderilmek uzere queue'ya da eklenir.
      if (authStatus === 'authenticated') {
        dispatch(
          enqueueSyncOperation({
            deck,
            id: createOperationId(),
            type: 'upsertDeck',
          })
        );
      }
    },
    [authStatus, dispatch]
  );

  const handleRemoveDeck = useCallback(
    (deckId: string) => {
      // Deck silerken alt kartlari once buluyoruz; cunku deck silindikten sonra
      // bu kartlari queue'ya deleteCard olarak yazmak icin id'lerine ihtiyac var.
      const deckCards = cards.filter((card) => card.deckId === deckId);
      dispatch(removeDeck(deckId));
      if (authStatus === 'authenticated') {
        deckCards.forEach((card) => {
          // Firestore'da kartlar deck subcollection icinde oldugu icin deck
          // silme oncesi kart silme operasyonlarini da acikca kaydediyoruz.
          dispatch(
            enqueueSyncOperation({
              cardId: card.id,
              deckId,
              id: createOperationId(),
              type: 'deleteCard',
            })
          );
        });
        dispatch(
          enqueueSyncOperation({
            deckId,
            id: createOperationId(),
            type: 'deleteDeck',
          })
        );
      }
    },
    [authStatus, cards, dispatch]
  );

  const handleUpdateDeck = useCallback(
    (deck: Deck) => {
      dispatch(updateDeck(deck));
      // Update de upsert operasyonudur: dokuman varsa guncellenir, yoksa
      // Firestore tarafinda ayni id ile olusturulur.
      if (authStatus === 'authenticated') {
        dispatch(
          enqueueSyncOperation({
            deck,
            id: createOperationId(),
            type: 'upsertDeck',
          })
        );
      }
    },
    [authStatus, dispatch]
  );

  return {
    decks,
    addDeck: handleAddDeck,
    removeDeck: handleRemoveDeck,
    updateDeck: handleUpdateDeck,
  };
};
