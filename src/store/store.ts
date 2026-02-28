// Redux store setup with persistence for decks and cards.
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

const rootReducer = combineReducers({
  decks: deckReducer,
  cards: cardReducer,
});

// Persist decks and cards to local storage.
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['decks', 'cards'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Ignore redux-persist actions in serializable checks.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
