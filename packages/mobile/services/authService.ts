// packages/mobile/services/authService.ts
import Constants from 'expo-constants'; // Para pegar a URL da API (se necessário)

// TODO: Mover isso para uma configuração de ambiente depois
// Use o IP da sua máquina se estiver testando em dispositivo físico no Android,
// ou mantenha localhost se no simulador/emulador ou iOS em dispositivo físico.
const API_URL = Constants?.expoConfig?.hostUri
  ? `http://${Constants.expoConfig.hostUri.split(':')[0]}:3333` // Usa o IP da máquina local detectado pelo Expo CLI
  : 'http://localhost:3333'; // Fallback para simulador/emulador iOS

const AUTH_BASE = `${API_URL}/auth`;

interface LoginResponse {
  accessToken: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    console.log(`Enviando para: ${AUTH_BASE}/login`); // Log para depuração
    try {
      const response = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a API retornou um erro (4xx, 5xx), pega a mensagem ou usa um padrão
        throw new Error(data.message || `Erro ${response.status}`);
      }

      // Verifica se o accessToken realmente veio na resposta
      if (!data.accessToken) {
        throw new Error('Resposta de login inválida recebida do servidor.');
      }

      return data as LoginResponse; // Retorna { accessToken: "..." }
    } catch (error) {
      console.error('Erro na chamada de login:', error);
      // Re-lança o erro para ser tratado no componente
      // ou retorna uma mensagem de erro mais amigável
      if (error instanceof Error) {
        throw new Error(
          error.message || 'Não foi possível conectar ao servidor.'
        );
      }
      throw new Error('Ocorreu um erro desconhecido no login.');
    }
  },
  // Futuramente: register, refreshToken, logout, etc.
};
