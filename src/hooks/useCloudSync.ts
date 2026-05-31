import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Card, Deck } from '../constants/types';
import {
  deleteCloudCard,
  deleteCloudDeck,
  fetchCloudVocabulary,
  upsertCloudCard,
  upsertCloudDeck,
} from '../services/firestoreService';
import { getValidAuthSession } from '../services/firebaseAuthService';
import { addCard } from '../store/slices/cardSlice';
import { addDeck, removeDeck, updateDeck } from '../store/slices/deckSlice';
import {
  clearSyncQueue,
  removeSyncOperation,
  setSyncOwner,
  syncFailed,
  syncStarted,
  syncSucceeded,
  type SyncOperation,
} from '../store/slices/syncSlice';
import type { AppDispatch, RootState } from '../store/store';
import { useNetworkStatus } from './useNetworkStatus';

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Cloud sync failed.';

const hydrateVocabulary = (
  dispatch: AppDispatch,
  existingDecks: Deck[],
  vocabulary: { cards: Card[]; decks: Deck[] }
) => {
  existingDecks.forEach((deck) => {
    dispatch(removeDeck(deck.id));
  });

  vocabulary.decks.forEach((deck) => {
    dispatch(addDeck({ ...deck, cardCount: 0 }));
  });

  vocabulary.cards.forEach((card) => {
    dispatch(addCard(card));
  });

  vocabulary.decks.forEach((deck) => {
    const cardCount = vocabulary.cards.filter(
      (card) => card.deckId === deck.id
    ).length;
    dispatch(updateDeck({ ...deck, cardCount }));
  });
};

const applyOperation = async (
  session: NonNullable<Awaited<ReturnType<typeof getValidAuthSession>>>,
  operation: SyncOperation
) => {
  switch (operation.type) {
    case 'deleteCard':
      await deleteCloudCard(session, operation.deckId, operation.cardId);
      break;
    case 'deleteDeck':
      await deleteCloudDeck(session, operation.deckId);
      break;
    case 'upsertCard':
      await upsertCloudCard(session, operation.card);
      break;
    case 'upsertDeck':
      await upsertCloudDeck(session, operation.deck);
      break;
    default:
      break;
  }
};

export const useCloudSync = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const cards = useSelector((state: RootState) => state.cards);
  const decks = useSelector((state: RootState) => state.decks);
  const sync = useSelector((state: RootState) => state.sync);
  const dispatch = useDispatch<AppDispatch>();
  const network = useNetworkStatus();

  const syncNow = useCallback(async () => {
    if (
      auth.status !== 'authenticated' ||
      !network.isConnected ||
      !network.isInternetReachable ||
      sync.status === 'syncing'
    ) {
      return;
    }

    dispatch(syncStarted());

    try {
      const session = await getValidAuthSession();

      if (!session) {
        throw new Error('Sign in before syncing.');
      }

      if (sync.ownerId !== session.user.id) {
        const vocabulary = await fetchCloudVocabulary(session);
        hydrateVocabulary(dispatch, decks, vocabulary);
        dispatch(setSyncOwner(session.user.id));
        dispatch(syncSucceeded());
        return;
      }

      await sync.queue.reduce(async (previousOperation, operation) => {
        await previousOperation;
        await applyOperation(session, operation);
        dispatch(removeSyncOperation(operation.id));
      }, Promise.resolve());

      await Promise.all(decks.map((deck) => upsertCloudDeck(session, deck)));
      await Promise.all(cards.map((card) => upsertCloudCard(session, card)));

      const vocabulary = await fetchCloudVocabulary(session);
      hydrateVocabulary(dispatch, decks, vocabulary);
      dispatch(clearSyncQueue());
      dispatch(syncSucceeded());
    } catch (error) {
      dispatch(syncFailed(toErrorMessage(error)));
    }
  }, [
    auth.status,
    cards,
    decks,
    dispatch,
    network.isConnected,
    network.isInternetReachable,
    sync.ownerId,
    sync.queue,
    sync.status,
  ]);

  return {
    ...sync,
    isOnline: network.isConnected && network.isInternetReachable,
    isSyncing: sync.status === 'syncing',
    pendingCount: sync.queue.length,
    syncNow,
  };
};
