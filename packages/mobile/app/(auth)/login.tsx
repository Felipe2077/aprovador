// packages/mobile/app/(auth)/login.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from '../../constants/Colors';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import styles from '../../styles/screens/AuthLogin.styles';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Tentando login com:', { username, password });

    try {
      const response = await authService.login(username, password);
      console.log('Login API success, calling loginSuccess action...');
      await loginSuccess(response.accessToken /*, optionalUserData */);
      console.log('loginSuccess action finished');
      router.replace('/');
    } catch (err: any) {
      console.error('Falha no login:', err);
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Acesse sua conta</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder='Usuário'
          placeholderTextColor={Colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize='none'
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder='Senha'
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size='small' color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
