// App root layout: wires Redux, persistence, and global UI for all tabs.
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../src/store/store';

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
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Tabs
            screenOptions={{
              headerTitleAlign: 'center',
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
              }}
            />
            <Tabs.Screen
              name="decks"
              options={{
                title: 'Decks',
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profile',
              }}
            />
          </Tabs>
        </View>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
