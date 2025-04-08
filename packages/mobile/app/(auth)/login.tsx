// packages/mobile/app/(auth)/login.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, // Para loading
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';
import Colors from '../../constants/Colors';
import { authService } from '../../services/authService';
import styles from '../../styles/screens/AuthLogin.styles';

const TOKEN_KEY = 'accessToken';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Tentando login com:', { username, password });

    try {
      // Chama a função de login do nosso serviço
      const response = await authService.login(username, password);

      // Se a chamada foi bem-sucedida (não lançou erro)
      console.log('Login bem-sucedido, token:', response.accessToken);

      // Salva o token de forma segura
      await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
      console.log('Token salvo no SecureStore');

      // TODO: Atualizar estado global de autenticação (ex: Zustand) aqui, se necessário.

      // Navega para a tela principal (substitui a tela de login no histórico)
      router.replace('/(tabs)/'); // Navega para a raiz do grupo (tabs)
    } catch (err: any) {
      // Captura o erro lançado pelo authService
      console.error('Falha no login:', err);
      // Define a mensagem de erro para exibir na tela
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      // Garante que o loading seja desativado, mesmo se der erro
      setIsLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView ajuda a tela a se ajustar quando o teclado abre
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
