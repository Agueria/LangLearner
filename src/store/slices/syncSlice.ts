import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Card, Deck } from '../../constants/types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

export type SyncOperation =
  | { card: Card; id: string; type: 'upsertCard' }
  | { cardId: string; deckId: string; id: string; type: 'deleteCard' }
  | { deck: Deck; id: string; type: 'upsertDeck' }
  | { deckId: string; id: string; type: 'deleteDeck' };

type SyncState = {
  error: string;
  lastSyncedAt: string;
  ownerId: string;
  queue: SyncOperation[];
  status: SyncStatus;
};

const initialState: SyncState = {
  error: '',
  lastSyncedAt: '',
  ownerId: '',
  queue: [],
  status: 'idle',
};

const isSameEntityOperation = (
  operation: SyncOperation,
  nextOperation: SyncOperation
) => {
  if (operation.type === 'upsertDeck' && nextOperation.type === 'upsertDeck') {
    return operation.deck.id === nextOperation.deck.id;
  }
  if (operation.type === 'upsertCard' && nextOperation.type === 'upsertCard') {
    return operation.card.id === nextOperation.card.id;
  }
  return false;
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    clearSyncQueue(state) {
      return { ...state, queue: [] };
    },
    enqueueSyncOperation(state, action: PayloadAction<SyncOperation>) {
      const nextOperation = action.payload;
      const nextQueue =
        nextOperation.type === 'deleteDeck'
          ? state.queue.filter((operation) => {
              if (operation.type === 'upsertDeck') {
                return operation.deck.id !== nextOperation.deckId;
              }
              if (operation.type === 'upsertCard') {
                return operation.card.deckId !== nextOperation.deckId;
              }
              if (operation.type === 'deleteCard') {
                return true;
              }
              return operation.deckId !== nextOperation.deckId;
            })
          : state.queue.filter(
              (operation) => !isSameEntityOperation(operation, nextOperation)
            );

      return {
        ...state,
        error: '',
        queue: [...nextQueue, nextOperation],
        status: state.status === 'failed' ? 'idle' : state.status,
      };
    },
    removeSyncOperation(state, action: PayloadAction<string>) {
      return {
        ...state,
        queue: state.queue.filter((operation) => operation.id !== action.payload),
      };
    },
    setSyncOwner(state, action: PayloadAction<string>) {
      return { ...state, ownerId: action.payload, queue: [] };
    },
    syncFailed(state, action: PayloadAction<string>) {
      return { ...state, error: action.payload, status: 'failed' };
    },
    syncStarted(state) {
      return { ...state, error: '', status: 'syncing' };
    },
    syncSucceeded(state) {
      return {
        ...state,
        error: '',
        lastSyncedAt: new Date().toISOString(),
        status: 'synced',
      };
    },
  },
});

export const {
  clearSyncQueue,
  enqueueSyncOperation,
  removeSyncOperation,
  setSyncOwner,
  syncFailed,
  syncStarted,
  syncSucceeded,
} = syncSlice.actions;
export default syncSlice.reducer;
