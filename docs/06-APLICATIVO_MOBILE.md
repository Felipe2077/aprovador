# 6. Aplicativo Mobile (`packages/mobile`)

Este documento descreve a arquitetura, tecnologias, principais componentes e fluxos do aplicativo mobile "Aprovador de Pagamentos Digital".

## 6.1. Visão Geral

O aplicativo mobile é o principal ponto de interação para todos os usuários do sistema (Solicitantes, Aprovadores, Diretores, Financeiro). Ele permite que os usuários gerenciem e participem do fluxo de aprovação de Requisições de Pagamento (APs) de forma intuitiva e eficiente.

- **Plataformas Alvo:** iOS e Android (desenvolvido com Expo/React Native).
- **Objetivo Principal:** Fornecer uma interface clara para visualização de APs, tomada de decisões (aprovar/rejeitar), configuração de fluxos de aprovação, acompanhamento de histórico e adição de informações/anexos relevantes.

## 6.2. Tecnologias Principais

- **Framework:** React Native (gerenciado pelo Expo SDK).
- **Linguagem:** TypeScript.
- **Navegação:** Expo Router (sistema de rotas baseado em arquivos).
- **Gerenciamento de Estado Global:** Zustand.
- **Comunicação com API:** Axios (com interceptors para JWT).
- **Armazenamento Seguro:** Expo Secure Store (para o `accessToken` JWT).
- **Componentes de UI Tabulada:** React Native Tab View.
- **Ícones:** `@expo/vector-icons`.
- **Placeholders de Carregamento:** React Native Skeleton Placeholder (com React Native Linear Gradient).
- **Gráficos (Modal de Histórico):** React Native Chart Kit (com React Native SVG).
- **Estilização:** StyleSheet do React Native, com um sistema de cores centralizado (`constants/Colors.ts`) e arquivos de estilo separados por componente/tela.

## 6.3. Estrutura de Navegação (Expo Router)

A navegação do aplicativo é gerenciada pelo Expo Router, utilizando uma estrutura de rotas baseada em arquivos e diretórios dentro de `packages/mobile/app/`.

- **`_layout.tsx` (Raiz):**
  - Layout principal que envolve toda a aplicação.
  - Gerencia o estado de autenticação global (`isLoadingAuth`, `isAuthenticated` via `useAuthStore`).
  - Renderiza condicionalmente o `AuthLoadingSkeleton`, redireciona para login (`/(auth)/login`) ou renderiza o `Stack` principal do aplicativo autenticado.
  - Configura o `ThemeProvider` e `StatusBar`.
- **Grupo `(auth)`:** Telas relacionadas à autenticação, fora do fluxo principal do app autenticado.
  - `_layout.tsx`: Define um `Stack` simples para as telas de autenticação (atualmente apenas login).
  - `login.tsx`: Tela de login para o usuário inserir credenciais.
- **Grupo `(tabs)`:** Navegação principal para usuários autenticados, usando abas no rodapé.
  - `_layout.tsx`: Define a `Tabs` navigation, configurando as abas (ex: "Pendências", "Perfil" - futuro).
  - `index.tsx`: Tela principal da primeira aba, listando as Requisições de Pagamento pendentes para o usuário (usando `SectionList`).
  - `profile.tsx` (Futuro/Placeholder): Tela de perfil do usuário.
- **`payment/[id].tsx`:**
  - Tela de Detalhes da Requisição de Pagamento.
  - Apresentada como um modal sobre a lista (ou como uma tela normal no Stack).
  - Utiliza `react-native-tab-view` internamente para organizar o conteúdo em abas ("Informações", "Comentários").
  - Contém a lógica para exibir detalhes, fluxo de aprovação (mock), anexos (mock), histórico de comentários (mock), e acionar modais (Rejeição, Histórico de Pagamentos do Favorecido).
- **Modais:**
  - Componentes como `RejectionModal` e `HistoryModal` são renderizados na tela `payment/[id].tsx` e controlados por estado local.

## 6.4. Gerenciamento de Estado (Zustand)

- **`authStore.ts`:**
  - Responsável pelo estado global de autenticação.
  - Guarda: `isAuthenticated` (boolean), `isLoadingAuth` (boolean), `user` (objeto `UserProfile` ou `BaseUser` após login/validação), `accessToken` (string | null).
  - Ações: `checkAuth()` (para verificar token no `SecureStore` e validar com `GET /users/me` na API), `loginSuccess(token, user?)` (para atualizar estado após login), `logout()` (para limpar estado e token).
- **`paymentStore.ts`:**
  - Responsável por gerenciar a lista de pagamentos exibida no app.
  - Atualmente, inicializado com `MOCK_PAYMENTS`.
  - Ações: `approvePayment(id)`, `rejectPayment(id)`, `cancelPayment(id)` (que modificam o status dos mocks).
  - Selector: `selectMemoizedGroupedPendingPayments` (usando `reselect`) para agrupar pagamentos pendentes por solicitante para a `SectionList`.
  - _(Observação: No futuro, com TanStack Query na Fase 2, a forma de buscar e gerenciar o "cache" dos pagamentos da API mudará significativamente, e o Zustand poderá focar mais em estado global de UI/sessão)._

## 6.5. Componentes Reutilizáveis Chave (em `packages/mobile/components/`)

- **`AppButton`:** Componente de botão customizado com variantes de estilo, suporte a ícones e estado de loading/disabled.
- **`PaymentListItem`:** Renderiza um item individual na lista de pagamentos, incluindo o indicador de urgência de vencimento (barra lateral e badge).
- **`PaymentDetailCard`:** Exibe os campos de detalhe principais de um pagamento dentro da aba "Informações".
- **`ApprovalFlow`:** Exibe a sequência de aprovação mockada.
- **`AttachmentList`:** Exibe a lista de anexos mockada.
- **`CommentHistoryTab`:** Exibe o histórico de comentários mockado na aba "Comentários".
- **`RejectionModal`:** Modal para o usuário inserir o motivo da rejeição.
- **`HistoryModal`:** Modal para exibir o histórico de pagamentos anteriores de um favorecido, incluindo sumário e gráfico.
- **`PaymentActionButtons`:** Container para os botões de ação (Aprovar, Rejeitar, Cancelar) no rodapé da tela de detalhes.
- **`AuthLoadingSkeleton`:** Placeholder visual para o carregamento inicial do app.
- **`PaymentDetailSkeleton`:** Placeholder visual para o carregamento da tela de detalhes.

## 6.6. Interação com API Backend

- **`services/apiClient.ts`:** Configuração centralizada do cliente Axios.
  - Define a `baseURL` da API.
  - Implementa um **interceptor de requisição** para ler o `accessToken` do `SecureStore` e adicioná-lo automaticamente ao header `Authorization: Bearer <token>` para chamadas protegidas.
  - (Futuro) Pode incluir um interceptor de resposta para tratar erros comuns ou lógica de refresh token.
- **`services/authService.ts`:**
  - Contém funções para interagir com os endpoints `/auth` da API (ex: `login()`, `getMe()`).
  - Usa a instância do `apiClient` para fazer as requisições.
- **(Futuro) `services/paymentService.ts`:**
  - Conterá funções para interagir com os endpoints `/payments` da API (listar, detalhar, aprovar, rejeitar, etc.).

## 6.7. Armazenamento Seguro

- Utiliza `expo-secure-store` para armazenar de forma segura o `accessToken` JWT no dispositivo do usuário após o login.

## 6.8. Considerações de UI/UX

- **Tema:** Tema Escuro Fixo aplicado através de `constants/Colors.ts` e `ThemeProvider`.
- **Feedback Visual:** Uso de `Alert`s para confirmações de ações. Indicadores de loading (skeletons, `ActivityIndicator`). Cores semânticas para status e botões.
- **Navegação:** Intuitiva e seguindo os padrões da plataforma, facilitada pelo Expo Router.
- **Responsividade (Básica):** Uso de `flexbox` e `useWindowDimensions` para alguns cálculos de layout.
