import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router'; // Importe useRouter, useSegments
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import Colors from '../constants/Colors';
import { useAuthStore } from '../store/authStore'; // Importe a store de auth

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    primary: Colors.primary,
    border: Colors.border,
  },
};

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments(); // Hook para saber em qual rota estamos

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

  useEffect(() => {
    console.log(
      'Auth State Changed: isLoadingAuth:',
      isLoadingAuth,
      'isAuthenticated:',
      isAuthenticated
    );

    if (isLoadingAuth) {
      console.log('Auth loading, skipping navigation.');

      return;
    }

    const inAuthGroup = segments[0] === '(auth)'; // Verifica se a rota atual está no grupo (auth)

    if (isAuthenticated && !inAuthGroup) {
      console.log('Authenticated, redirecting to /');
      router.replace('/'); // Vai para a tela inicial do grupo (tabs)
    } else if (!isAuthenticated && !inAuthGroup) {
      console.log('Not authenticated, redirecting to /login');
      router.replace('/(auth)/login'); // Vai para a tela de login
    } else if (isAuthenticated && inAuthGroup) {
      console.log('Authenticated but in auth group, redirecting to /');
      router.replace('/');
    }
    // Se !isAuthenticated e inAuthGroup, já está onde deveria (tela de login), não faz nada
  }, [isAuthenticated, isLoadingAuth, segments, router]);

  if (isLoadingAuth) {
    // return <SplashScreenComponent />; // Ou simplesmente null
    return null; // Ou um ActivityIndicator tela cheia
  }

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.background);
  }, []);
  return (
    <ThemeProvider value={AppDarkTheme}>
      <StatusBar style='light' />
      <Stack
        screenOptions={{
          title: 'Pagamento',
        }}
      >
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
