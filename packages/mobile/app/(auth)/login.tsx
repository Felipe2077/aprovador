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
import Colors from '../../constants/Colors'; // Ajuste o caminho
import styles from '../../styles/screens/AuthLogin.styles'; // Ajuste o caminho

export default function LoginScreen() {
  const router = useRouter();

  // Estados locais para os inputs, erro e loading
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder da função de login (implementaremos a chamada API depois)
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Tentando login com:', { username, password });

    // --- Simulação / Lógica da API virá aqui ---
    // Exemplo: await authService.login(username, password);
    // Se sucesso: Salvar token e navegar
    // Se erro: setError('Mensagem de erro');
    // --- Fim da Simulação ---

    // Simplesmente loga por enquanto
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula espera

    // Exemplo de navegação (faremos após salvar token)
    // router.replace('/(tabs)/');

    // Exemplo de erro (descomente para testar)
    // setError('Credenciais inválidas (teste)');

    setIsLoading(false);
  };

  return (
    // KeyboardAvoidingView ajuda a tela a se ajustar quando o teclado abre
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }} // Ocupa toda a tela
    >
      <View style={styles.container}>
        <Text style={styles.title}>Entrar</Text>

        {/* Mostra mensagem de erro se existir */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder='Usuário'
          placeholderTextColor={Colors.textMuted} // Cor do placeholder
          value={username}
          onChangeText={setUsername}
          autoCapitalize='none' // Não colocar primeira letra maiúscula
          editable={!isLoading} // Desabilita enquanto carrega
        />

        <TextInput
          style={styles.input}
          placeholder='Senha'
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry // Esconde a senha
          editable={!isLoading}
        />

        <View style={styles.buttonContainer}>
          {/* Usando TouchableOpacity para botão customizado */}
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]} // Reduz opacidade no loading
            onPress={handleLogin}
            disabled={isLoading} // Desabilita botão no loading
          >
            {/* Mostra ActivityIndicator ou Texto */}
            {isLoading ? (
              <ActivityIndicator size='small' color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Indicador de loading opcional fora do botão */}
        {/* {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="large" color={Colors.primary} />} */}
      </View>
    </KeyboardAvoidingView>
  );
}
