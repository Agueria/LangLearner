import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Card } from '../constants/types';
import type { AppDispatch, RootState } from '../store/store';
import { addCard, removeCard, updateCard } from '../store/slices/cardSlice';

export const useCards = () => {
  const cards = useSelector((state: RootState) => state.cards);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddCard = useCallback(
    (card: Card) => {
      dispatch(addCard(card));
    },
    [dispatch]
  );

  const handleRemoveCard = useCallback(
    (cardId: string) => {
      dispatch(removeCard(cardId));
    },
    [dispatch]
  );

  const handleUpdateCard = useCallback(
    (card: Card) => {
      dispatch(updateCard(card));
    },
    [dispatch]
  );

  return {
    cards,
    addCard: handleAddCard,
    removeCard: handleRemoveCard,
    updateCard: handleUpdateCard,
  };
};
