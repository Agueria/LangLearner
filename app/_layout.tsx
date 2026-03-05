// App root layout: wires Redux, persistence, and global UI for all routes.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { persistor, store } from '../src/store/store';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default function RootLayout() {
  return (
    <Provider store={store}>
      {/* Delay UI until persisted state is rehydrated. */}
      <PersistGate
        persistor={persistor}
        loading={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <GestureHandlerRootView style={styles.container}>
          {/* eslint-disable-next-line react/style-prop-object */}
          <StatusBar style="auto" />
          {/* Global banner for connectivity changes. */}
          <OfflineBanner />
          <Slot />
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
