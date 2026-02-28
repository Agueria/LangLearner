import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Deck } from '../constants/types';
import type { AppDispatch, RootState } from '../store/store';
import { addDeck, removeDeck, updateDeck } from '../store/slices/deckSlice';

export const useDecks = () => {
  const decks = useSelector((state: RootState) => state.decks);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddDeck = useCallback(
    (deck: Deck) => {
      dispatch(addDeck(deck));
    },
    [dispatch]
  );

  const handleRemoveDeck = useCallback(
    (deckId: string) => {
      dispatch(removeDeck(deckId));
    },
    [dispatch]
  );

  const handleUpdateDeck = useCallback(
    (deck: Deck) => {
      dispatch(updateDeck(deck));
    },
    [dispatch]
  );

  return {
    decks,
    addDeck: handleAddDeck,
    removeDeck: handleRemoveDeck,
    updateDeck: handleUpdateDeck,
  };
};
