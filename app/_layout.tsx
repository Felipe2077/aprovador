import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import Colors from '../constants/Colors';

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
      </Stack>
    </ThemeProvider>
  );
}
