// Redux store uygulamanin merkezi hafizasidir.
// Sunumda soyle anlatabilirsin:
// - Ekranlar veriyi dogrudan AsyncStorage veya Firestore'dan okumaz.
// - Deck/card/settings/sync gibi durumlar once Redux'a yazilir.
// - redux-persist secilen alanlari AsyncStorage'a kaydeder.
// - Auth tokenlari ise guvenlik icin burada degil SecureStore'da tutulur.
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import deckReducer from './slices/deckSlice';
import cardReducer from './slices/cardSlice';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import syncReducer from './slices/syncSlice';

const rootReducer = combineReducers({
  // auth: sadece aktif kullanici ve auth ekran durumunu tutar.
  // Token gibi hassas bilgiler SecureStore servisinde saklanir.
  auth: authReducer,
  // decks/cards: uygulamanin ana ogrenme verisi.
  decks: deckReducer,
  cards: cardReducer,
  // settings: dil, tema ve bildirim tercihi gibi kullanici ayarlari.
  settings: settingsReducer,
  // sync: offline queue ve son cloud sync durumunu takip eder.
  sync: syncReducer,
});

// Persist whitelist bilerek secildi:
// deck/card/settings/sync cihazda kalici olsun, ama auth slice kalici olmasin.
// Login session'i SecureStore'dan bootstrap ettigimiz icin token daha guvenli
// bir native depoda kalir.
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['decks', 'cards', 'settings', 'sync'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist kendi ic aksiyonlarinda non-serializable bilgiler
      // tasiyabilir. Bunlari ignore etmezsek development'ta gereksiz warning
      // aliriz; uygulama state'imiz yine serializable kalir.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
