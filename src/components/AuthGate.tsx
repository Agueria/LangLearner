import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks';

type AuthGateProps = {
  children: React.ReactNode;
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const segments = useSegments();
  const { bootstrap, isLoading, status } = useAuth();
  const isAuthRoute = segments[0] === 'auth';

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (status !== 'authenticated' && !isAuthRoute) {
      router.replace('/auth/login');
      return;
    }

    if (status === 'authenticated' && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthRoute, isLoading, router, status]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
