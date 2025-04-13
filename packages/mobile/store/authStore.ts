// packages/mobile/store/authStore.ts
import * as SecureStore from 'expo-secure-store';
import { UserProfile } from 'shared-types';
import { create } from 'zustand';

// Definição simplificada do User (ajuste conforme necessário ou importe do local correto)

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean; // Para saber se a verificação inicial está ocorrendo
  checkAuth: () => Promise<void>;
  loginSuccess: (token: string, userData?: UserProfile) => Promise<void>; // Adicionado para simplificar o fluxo de login
  logout: () => Promise<void>;
}

// Chave para o SecureStore
const TOKEN_KEY = 'accessToken';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoadingAuth: true,

  // Ação chamada no login bem-sucedido
  loginSuccess: async (token: string, userData?: UserProfile) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    // Se os dados do usuário já vieram do /me (ou login), armazena
    // Senão, poderíamos chamar /me aqui
    set({
      accessToken: token,
      user: userData || null,
      isAuthenticated: true,
      isLoadingAuth: false,
    });
  },

  // Ação para verificar o token no início ou refresh
  checkAuth: async () => {
    console.log('checkAuth: Verificando autenticação...');
    set({ isLoadingAuth: true });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        console.log('checkAuth: Token encontrado no SecureStore.');
        // **Opcional (Recomendado): Validar token chamando /users/me**
        // Isso garante que o token ainda é válido no backend e pega dados atualizados do user
        // try {
        // TODO: Adicionar função authService.getMe() que usa o token para chamar GET /users/me
        //   const userData = await authService.getMe(token); // Passa o token para o serviço usar no header
        //   console.log('checkAuth: Token validado via /me, usuário:', userData.username);
        //   set({ accessToken: token, user: userData, isAuthenticated: true, isLoadingAuth: false });
        // } catch (apiError) {
        //   console.warn('checkAuth: Falha ao validar token com /me ou token expirado.', apiError);
        //   await SecureStore.deleteItemAsync(TOKEN_KEY); // Limpa token inválido
        //   set({ accessToken: null, user: null, isAuthenticated: false, isLoadingAuth: false });
        // }
        // *** Fim Bloco Opcional ***

        // *** Início Bloco Simples (sem validação /me) ***
        // Apenas assume que se o token existe, está autenticado (menos seguro)
        console.log(
          'checkAuth: Assumindo autenticado por existência de token.'
        );
        // Poderíamos tentar decodificar o token aqui para pegar user info se não chamarmos /me
        set({
          accessToken: token,
          user: null /* TODO: Pegar user data */,
          isAuthenticated: true,
          isLoadingAuth: false,
        });
        // *** Fim Bloco Simples ***
      } else {
        console.log('checkAuth: Nenhum token encontrado.');
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoadingAuth: false,
        });
      }
    } catch (error) {
      console.error('checkAuth: Erro ao acessar SecureStore:', error);
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoadingAuth: false,
      });
    }
  },

  logout: async () => {
    console.log('logout: Removendo token e resetando estado.');
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('logout: Erro ao remover token do SecureStore:', error);
    } finally {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoadingAuth: false,
      });
    }
  },
}));

useAuthStore.getState().checkAuth();
