import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Deck } from '../constants/types';
import type { AppDispatch, RootState } from '../store/store';
import { addDeck, removeDeck, updateDeck } from '../store/slices/deckSlice';
import { enqueueSyncOperation } from '../store/slices/syncSlice';

const createOperationId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useDecks = () => {
  const decks = useSelector((state: RootState) => state.decks);
  const cards = useSelector((state: RootState) => state.cards);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddDeck = useCallback(
    (deck: Deck) => {
      dispatch(addDeck(deck));
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
      const deckCards = cards.filter((card) => card.deckId === deckId);
      dispatch(removeDeck(deckId));
      if (authStatus === 'authenticated') {
        deckCards.forEach((card) => {
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
