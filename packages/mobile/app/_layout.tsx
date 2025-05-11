import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import Colors from '../constants/Colors';
import { useAuthStore } from '../store/authStore';
import AuthLoadingSkeleton from '@/components/AuthLoadingSkeleton';

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
      'Auth Effect Triggered. isLoading:',
      isLoadingAuth,
      'isAuth:',
      isAuthenticated,
      'Segments:',
      segments
    );

    if (isLoadingAuth) {
      console.log('Auth Effect: Still loading auth status.');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Lógica de redirecionamento:
    if (isAuthenticated && inAuthGroup) {
      console.log(
        'Auth Effect: Authenticated user in auth group, redirecting to /'
      );
      router.replace('/');
    } else if (!isAuthenticated && !inAuthGroup) {
      console.log(
        'Auth Effect: Not authenticated and outside auth group, redirecting to login.'
      );
      router.replace('/(auth)/login');
    } else {
      console.log('Auth Effect: No automatic redirect needed.');
    }
  }, [isAuthenticated, isLoadingAuth, segments, router]); // Dependências importantes!

  if (isLoadingAuth) {
    // return <SplashScreenComponent />; // Ou simplesmente null
    return <AuthLoadingSkeleton />; // Ou um ActivityIndicator tela cheia
  }

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.background);
  }, []);
  return (
    <ThemeProvider value={AppDarkTheme}>
      <StatusBar style='light' />
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
