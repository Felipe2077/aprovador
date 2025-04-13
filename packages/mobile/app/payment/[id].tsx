import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Route,
  SceneMap,
  TabBar,
  TabBarProps,
  TabView,
} from 'react-native-tab-view';

// Imports do Projeto (VERIFIQUE OS CAMINHOS!)
import { Payment, PaymentStatus } from 'shared-types'; // Tipos de shared-types
import AppButton from '../../components/AppButton'; // Botão customizado
import ApprovalFlow from '../../components/ApprovalFlow'; // Componente Fluxo
import AttachmentList from '../../components/AttachmentList'; // Componente Anexos
import CommentHistoryTab from '../../components/CommentHistory'; // <--- Importe
import PaymentActionButtons from '../../components/PaymentActionButtons'; // Botões de Ação Fixos
import PaymentDetailCard from '../../components/PaymentDetailCard'; // Card de Detalhes
import RejectionModal from '../../components/RejectionModal'; // Modal Rejeição
import Colors from '../../constants/Colors'; // Cores
import { usePaymentStore } from '../../store/paymentStore'; // Store Pagamentos (para actions)
import styles from '../../styles/screens/[id].styles'; // Estilos da Tela

// Define o tipo para as rotas das abas
type PaymentTabRoute = Route & {
  key: 'details' | 'history';
};

export default function PaymentDetailScreen() {
  // --- Hooks de Navegação e Layout ---
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useWindowDimensions();

  // --- Store Actions ---
  const approvePayment = usePaymentStore((state) => state.approvePayment);
  const rejectPayment = usePaymentStore((state) => state.rejectPayment);
  const cancelPayment = usePaymentStore((state) => state.cancelPayment);
  // ----------------------------------------------------

  // --- Estados Locais da Tela ---
  const [loading, setLoading] = useState<boolean>(true); // Loading inicial dos dados
  const [paymentDetails, setPaymentDetails] = useState<
    Payment | null | undefined
  >(undefined); // Dados do pagamento
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false); // Visibilidade do modal de rejeição

  // --- Estado Local das Abas ---
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState<PaymentTabRoute[]>([
    { key: 'details', title: 'Informações' },
    { key: 'history', title: 'Histórico' },
  ]);

  // --- Mocks Temporários para Placeholders ---
  const mockApprovalSequence = [
    { id: 'u1', name: 'João Silva', status: 'Aprovado' },
    { id: 'u2', name: 'Maria Souza', status: 'Pendente' },
    { id: 'u3', name: 'Diretor X', status: 'Não Iniciado' },
    { id: 'u4', name: 'Financeiro Dept', status: 'Não Iniciado' },
  ];
  const mockComments = [
    {
      id: 'c1',
      author: 'Diretor X',
      date: '12/04/2025 15:30',
      text: 'Rejeitado. Favor detalhar...',
    },
    {
      id: 'c2',
      author: paymentDetails?.requesterName || 'Solicitante',
      date: '13/04/2025 09:15',
      text: 'Ajuste feito.',
    },
  ];
  const mockAttachments = [
    { id: 'a1', name: 'nota_fiscal_12345.pdf', type: 'pdf' },
    { id: 'a2', name: 'comprovante.jpg', type: 'image' },
  ];

  // --- Efeito para Buscar Dados Iniciais ---
  useEffect(() => {
    console.log(`[Effect] Buscando detalhes para ID: ${id}`);
    setLoading(true);
    setPaymentDetails(undefined);
    const timer = setTimeout(() => {
      // Simulação de busca (substituir por chamada API com TanStack Query na Fase 2)
      const foundPayment = usePaymentStore
        .getState()
        .payments.find((p) => p.id === id);
      console.log(
        `[Effect] Busca simulada concluída, encontrado: ${!!foundPayment}`
      );
      setPaymentDetails(foundPayment || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]); // Dependência no ID da rota

  // --- Handlers de Ação ---
  const handleApprove = useCallback(() => {
    if (!paymentDetails) return;
    approvePayment(paymentDetails.id);
    Alert.alert('Sucesso', `Pagamento para ${paymentDetails.payee} aprovado!`);
    router.back();
  }, [paymentDetails, approvePayment, router]);
  const handleReject = useCallback(() => {
    if (!paymentDetails) return;
    setIsRejectModalVisible(true);
  }, [paymentDetails]);
  const handleCancel = useCallback(() => {
    if (!paymentDetails) return;
    cancelPayment(paymentDetails.id);
    Alert.alert(
      'Cancelado',
      `Pagamento para ${paymentDetails.payee} cancelado.`
    );
    router.back();
  }, [paymentDetails, cancelPayment, router]);
  const handleConfirmRejection = useCallback(
    (reasonFromModal: string) => {
      if (!paymentDetails) return;
      console.log(
        `CONFIRMANDO Rejeição para ${paymentDetails.id}. Motivo: ${reasonFromModal}`
      );

      // --- ADICIONAR ESTA LINHA ---
      rejectPayment(paymentDetails.id); // Chama a ação da store para mudar status para REJECTED
      // --------------------------

      // TODO - Fase 3: Passar reasonFromModal para a ação/API

      setIsRejectModalVisible(false);
      Alert.alert(
        'Rejeitado',
        `Pagamento para ${paymentDetails.payee} rejeitado (motivo simulado).`
      );
      router.back();
    },
    [paymentDetails, rejectPayment, router]
  ); // Adicionei rejectPayment aqui também agora
  // --- Componentes das Cenas das Abas ---

  // Aba "Informações": Contém detalhes, fluxo e anexos (dentro de um ScrollView)
  const DetailsTabScene = useCallback(
    () => (
      <ScrollView
        style={styles.tabSceneContainer} // Estilo com flex: 1
        contentContainerStyle={styles.tabScrollContentContainer} // Estilo com padding e flexGrow: 1
        keyboardShouldPersistTaps='handled'
      >
        {/* Renderiza os componentes extraídos passando os dados */}
        {paymentDetails && <PaymentDetailCard payment={paymentDetails} />}
        <ApprovalFlow sequence={mockApprovalSequence} />
        <AttachmentList attachments={mockAttachments} />
        {/* Botões de ação foram movidos para fora/abaixo do TabView */}
      </ScrollView>
    ),
    [paymentDetails, mockApprovalSequence, mockAttachments]
  ); // Dependências corretas

  // Aba "Histórico": Exibe os comentários mockados (usará FlatList/componente depois)
  const HistoryTabScene = useCallback(
    () => (
      // Renderiza o componente dedicado, passando os mocks
      <CommentHistoryTab comments={mockComments} />
    ),
    [mockComments]
  ); // Dependência no mock

  // --- Configuração do TabView (renderScene e renderTabBar) ---
  const renderScene = SceneMap({
    details: DetailsTabScene,
    history: HistoryTabScene,
  });

  const renderTabBar = useCallback(
    (props: TabBarProps<PaymentTabRoute>) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: Colors.primary }}
        style={{ backgroundColor: Colors.card }}
        activeColor={Colors.primary}
        inactiveColor={Colors.textMuted}
        scrollEnabled={tabRoutes.length > 3} // Permite scroll se tiver muitas abas
        tabStyle={{ width: 'auto', minWidth: 100, paddingHorizontal: 12 }}
        renderLabel={({
          route,
          focused,
          color,
        }: {
          // <-- Defina os tipos inline aqui
          route: PaymentTabRoute;
          focused: boolean;
          color: string;
        }) => <Text style={[styles.tabLabel, { color }]}>{route.title}</Text>}
      />
    ),
    [tabRoutes.length]
  ); // Dependência apenas no número de rotas

  // --- Renderização Condicional (Loading / Erro) ---
  if (loading) {
    return (
      // Container para centralizar o Loading
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors.background },
        ]}
      >
        {/* Configura o Header da tela durante o loading */}
        <Stack.Screen
          options={{
            title: 'Carregando...',
            headerTintColor: Colors.text,
            headerBackTitle: '',
          }}
        />
        <ActivityIndicator size='large' color={Colors.primary} />
        <Text style={styles.loadingText}>Buscando detalhes...</Text>
      </View>
    );
  }

  if (!paymentDetails) {
    return (
      // Container para centralizar o Erro
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors.background },
        ]}
      >
        {/* Configura o Header da tela para o erro */}
        <Stack.Screen
          options={{
            title: 'Erro',
            headerTintColor: Colors.text,
            headerBackTitle: '',
          }}
        />
        <Text style={styles.errorText}>Pagamento não encontrado.</Text>
        {/* Botão para voltar */}
        <AppButton
          title='Voltar para Lista'
          onPress={() => router.back()}
          variant='primary'
          style={{ minWidth: 150 }} // Estilo extra para o botão
        />
      </View>
    );
  }

  // --- Renderização Principal (Layout de Sucesso com Abas) ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }} // Container principal ocupa toda a tela
    >
      {/* Configuração do Header com título dinâmico */}
      <Stack.Screen
        options={{
          title: `Pagamento ${paymentDetails.id}`,
          headerTintColor: Colors.text,
          headerBackTitle: '',
        }}
      />

      {/* Título abaixo do Header */}
      <Text style={styles.title}>Detalhes do Pagamento</Text>

      {/* TabView ocupa o espaço principal entre Título e Botões de Ação */}
      <TabView
        navigationState={{ index: tabIndex, routes: tabRoutes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={{ flex: 1 }} // Garante que ele expanda verticalmente
        lazy // Otimização: renderiza abas apenas quando focadas
      />

      {/* Botões de Ação (Aparecem apenas se o status for PENDING) */}
      {paymentDetails.status === PaymentStatus.PENDING && (
        <PaymentActionButtons
          onApprove={handleApprove}
          onReject={handleReject} // Abre o modal de rejeição
          onCancel={handleCancel}
          isLoading={false} // TODO: Usar um estado de loading para as *ações* depois
        />
      )}

      {/* Modal de Rejeição (renderizado aqui, mas controlado pelo estado isRejectModalVisible) */}
      <RejectionModal
        isVisible={isRejectModalVisible}
        payeeName={paymentDetails?.payee || ''}
        onClose={() => setIsRejectModalVisible(false)}
        onSubmit={handleConfirmRejection}
      />
    </KeyboardAvoidingView>
  );
} // Fim do componente PaymentDetailScreen
