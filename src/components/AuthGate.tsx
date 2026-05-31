import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks';

// AuthGate route koruma katmanidir.
// Uygulama acilinca once SecureStore session bootstrap edilir. Sonuca gore
// kullanici login/register ekraninda mi kalacak, yoksa tab'lara mi gidecek
// burada belirlenir.
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
    // Root layout mount olunca session kontrolu baslar.
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (status !== 'authenticated' && !isAuthRoute) {
      // Login olmayan kullanici protected tab/deck/quiz ekranlarina giremez.
      router.replace('/auth/login');
      return;
    }

    if (status === 'authenticated' && isAuthRoute) {
      // Zaten login olan kullanici tekrar login/register ekraninda kalmaz.
      router.replace('/(tabs)');
    }
  }, [isAuthRoute, isLoading, router, status]);

  if (isLoading) {
    // Session kontrolu bitmeden route karari vermiyoruz; aksi halde ekranlar
    // kisa sure yanlis route'a gidip geri donebilir.
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
