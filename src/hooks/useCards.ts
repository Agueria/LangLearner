import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Card } from '../constants/types';
import type { AppDispatch, RootState } from '../store/store';
import { addCard, removeCard, updateCard } from '../store/slices/cardSlice';
import { enqueueSyncOperation } from '../store/slices/syncSlice';

type RemoveCardPayload = {
  cardId: string;
  deckId: string;
};

const createOperationId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// useCards, kart CRUD islemlerinin tek giris noktasidir.
// Ekranlar bu hook'u kullaninca local-first davranis otomatik olur:
// once Redux guncellenir, kullanici login ise cloud sync queue arka planda dolar.
export const useCards = () => {
  const cards = useSelector((state: RootState) => state.cards);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddCard = useCallback(
    (card: Card) => {
      dispatch(addCard(card));
      // Kart kullaniciya hemen gorunur. Internet yoksa sync queue islemi
      // saklar ve CloudSyncController internet gelince tekrar dener.
      if (authStatus === 'authenticated') {
        dispatch(
          enqueueSyncOperation({
            card,
            id: createOperationId(),
            type: 'upsertCard',
          })
        );
      }
    },
    [authStatus, dispatch]
  );

  const handleRemoveCard = useCallback(
    ({ cardId, deckId }: RemoveCardPayload) => {
      dispatch(removeCard({ cardId, deckId }));
      // Delete operasyonunda hem cardId hem deckId gerekir; Firestore path'i
      // users/{userId}/decks/{deckId}/cards/{cardId} seklindedir.
      if (authStatus === 'authenticated') {
        dispatch(
          enqueueSyncOperation({
            cardId,
            deckId,
            id: createOperationId(),
            type: 'deleteCard',
          })
        );
      }
    },
    [authStatus, dispatch]
  );

  const handleUpdateCard = useCallback(
    (card: Card) => {
      dispatch(updateCard(card));
      // Kart duzenleme de upsert olarak kuyruga girer. Boylece offline
      // duzenlenen kart internet gelince son haliyle cloud'a yazilir.
      if (authStatus === 'authenticated') {
        dispatch(
          enqueueSyncOperation({
            card,
            id: createOperationId(),
            type: 'upsertCard',
          })
        );
      }
    },
    [authStatus, dispatch]
  );

  return {
    cards,
    addCard: handleAddCard,
    removeCard: handleRemoveCard,
    updateCard: handleUpdateCard,
  };
};
