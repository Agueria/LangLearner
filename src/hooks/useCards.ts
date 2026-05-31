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

export const useCards = () => {
  const cards = useSelector((state: RootState) => state.cards);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddCard = useCallback(
    (card: Card) => {
      dispatch(addCard(card));
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
