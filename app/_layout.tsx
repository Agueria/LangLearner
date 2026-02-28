import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <>
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
      </>
    </Provider>
  );
}
