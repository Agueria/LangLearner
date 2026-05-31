import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Card, Deck } from '../../constants/types';

// SyncStatus, Profile ekraninda "syncing", "synced" veya hata metni
// gostermek icin kullanilir.
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed';

// Offline queue'da tutulabilecek her islem burada tiplenir.
// Deck/card ekleme-duzenleme "upsert", silme islemleri ise delete olarak
// saklanir. Internet yokken yapilan degisiklikler daha sonra Firestore'a
// ayni sira ile replay edilir.
export type SyncOperation =
  | { card: Card; id: string; type: 'upsertCard' }
  | { cardId: string; deckId: string; id: string; type: 'deleteCard' }
  | { deck: Deck; id: string; type: 'upsertDeck' }
  | { deckId: string; id: string; type: 'deleteDeck' };

type SyncState = {
  error: string;
  lastSyncedAt: string;
  // ownerId, local cache'in hangi Firebase kullanicisina ait oldugunu tutar.
  // Boylece kullanici degisince eski kisinin verisi yeni hesaba upload edilmez.
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
  // Ayni deck veya card icin pes pese upsert gelirse eski upsert'i atip
  // sadece son halini queue'da tutuyoruz. Bu hem Firestore istegini azaltir
  // hem de "last local edit wins" davranisini netlestirir.
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
          // Bir deck silindiyse queue icindeki o deck'e ait bekleyen upsert
          // islemleri anlamsiz kalir. Silme islemini eklemeden once bunlari
          // temizliyoruz ki silinen veri tekrar cloud'a yazilmasin.
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
              // Delete disindaki islemlerde ayni entity icin eski upsert'i
              // cikarip yeni islemle degistiriyoruz.
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
      // Kullanici degistiginde queue sifirlanir. Bu guvenlik icin onemli:
      // A kullanicisinin offline degisikligi B kullanicisina gitmemeli.
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
