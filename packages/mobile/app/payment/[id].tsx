// packages/mobile/app/payment/[id].tsx
// VERSÃO COMPLETA E CORRIGIDA: TabView + HistoryModal integrado + Correção Zustand

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

// Imports do Projeto
import HistoryModal from '@/components/HistoryModal';
import { formatCurrency } from '@/constants/formatCurrency';
import { HistoryItem, Payment, PaymentStatus } from 'shared-types'; // Tipos de shared-types
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
  key: 'details' | 'comments'; // Mantido 'comments' para o histórico da REQUISIÇÃO ATUAL
};

export default function PaymentDetailScreen() {
  // --- Hooks ---
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useWindowDimensions();

  // --- Store Actions (Seleção Individual CORRIGIDA) ---
  const approvePayment = usePaymentStore((state) => state.approvePayment);
  const rejectPayment = usePaymentStore((state) => state.rejectPayment);
  const cancelPayment = usePaymentStore((state) => state.cancelPayment);
  // Pega todos os pagamentos da store para filtrar o histórico do favorecido
  const allPaymentsFromStore = usePaymentStore((state) => state.payments);
  // ----------------------------------------------------

  // --- Estados Locais da Tela ---
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<
    Payment | null | undefined
  >(undefined);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);

  // Estado para o MODAL DE HISTÓRICO DE PAGAMENTOS DO FAVORECIDO
  const [isPayeeHistoryModalVisible, setIsPayeeHistoryModalVisible] =
    useState(false);
  // Estado para guardar os dados formatados para o modal de histórico do favorecido
  const [paymentHistoryForModal, setPaymentHistoryForModal] = useState<
    HistoryItem[]
  >([]);

  // --- Estado Local das Abas ---
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState<PaymentTabRoute[]>([
    { key: 'details', title: 'Informações' },
    { key: 'comments', title: 'Comentários' },
  ]);

  // --- Mocks Temporários ---
  const mockApprovalSequence = [
    { id: 'u1', name: 'João Silva', status: 'Aprovado' },
    { id: 'u2', name: 'Maria Souza', status: 'Pendente' },
    { id: 'u3', name: 'Diretor X', status: 'Não Iniciado' },
    { id: 'u4', name: 'Financeiro Dept', status: 'Não Iniciado' },
  ];
  const mockCommentsData = [
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
    if (id) {
      // Verifica se o ID existe
      console.log(`[Effect] Buscando detalhes para ID: ${id}`);
      setLoading(true);
      setPaymentDetails(undefined);
      const timer = setTimeout(() => {
        const foundPayment = allPaymentsFromStore.find((p) => p.id === id);
        console.log(
          `[Effect] Busca simulada concluída, encontrado: ${!!foundPayment}`
        );
        setPaymentDetails(foundPayment || null);
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      console.error(
        '[Effect] ID do pagamento não encontrado nos parâmetros da rota.'
      );
      setPaymentDetails(null); // Define como null para mostrar tela de erro
      setLoading(false);
    }
  }, [id, allPaymentsFromStore]); // Adiciona allPaymentsFromStore como dependência

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
      rejectPayment(paymentDetails.id);
      setIsRejectModalVisible(false);
      Alert.alert(
        'Rejeitado',
        `Pagamento para ${paymentDetails.payee} rejeitado.`
      );
      router.back();
    },
    [paymentDetails, rejectPayment, router]
  );

  // --- Handler para abrir e PREPARAR DADOS do MODAL DE HISTÓRICO DE PAGAMENTOS DO FAVORECIDO ---
  const handleOpenPayeeHistoryModal = useCallback(() => {
    if (!paymentDetails) return;

    console.log(
      `[handleOpenPayeeHistoryModal] Abrindo histórico para payee: ${paymentDetails.payee}`
    );
    const history = allPaymentsFromStore
      .filter(
        (p) =>
          p.payee === paymentDetails.payee &&
          p.status === PaymentStatus.APPROVED &&
          p.id !== paymentDetails.id
      )
      .sort(
        (a, b) =>
          new Date(b.dueDate || b.createdAt).getTime() -
          new Date(a.dueDate || a.createdAt).getTime()
      )
      .map((p) => ({
        // Mapeia para a estrutura HistoryItem de shared-types
        id: p.id,
        displayDate: new Intl.DateTimeFormat('pt-BR', {
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(p.dueDate || p.createdAt)),
        formattedAmount: formatCurrency(p.amount, p.currency),
      }));

    console.log('[handleOpenPayeeHistoryModal] Histórico formatado:', history);
    setPaymentHistoryForModal(history); // Define os dados formatados para o estado
    setIsPayeeHistoryModalVisible(true); // Abre o modal
  }, [paymentDetails, allPaymentsFromStore, formatCurrency]); // Adicionado formatCurrency
  // -----------------------------------------------------------------------------------

  // --- Componentes das Cenas das Abas ---
  const DetailsTabScene = useCallback(
    () => (
      <ScrollView
        style={styles.tabSceneContainer}
        contentContainerStyle={styles.tabScrollContentContainer}
        keyboardShouldPersistTaps='handled'
      >
        {paymentDetails && (
          <PaymentDetailCard
            payment={paymentDetails}
            onViewPayeeHistory={handleOpenPayeeHistoryModal}
          />
        )}
        <ApprovalFlow sequence={mockApprovalSequence} />
        <AttachmentList attachments={mockAttachments} />
      </ScrollView>
    ),
    [
      paymentDetails,
      mockApprovalSequence,
      mockAttachments,
      handleOpenPayeeHistoryModal,
    ]
  );

  const CommentsTabScene = useCallback(
    () => <CommentHistoryTab comments={mockCommentsData} />,
    [mockCommentsData, paymentDetails]
  ); // Adicionado paymentDetails por causa do mockCommentsData

  // --- Configuração do TabView ---
  const renderScene = SceneMap({
    details: DetailsTabScene,
    comments: CommentsTabScene,
  });

  const renderTabBar = useCallback(
    (props: TabBarProps<PaymentTabRoute>) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: Colors.primary }}
        style={{ backgroundColor: Colors.card }}
        activeColor={Colors.primary}
        inactiveColor={Colors.textMuted}
        scrollEnabled={tabRoutes.length > 2}
        tabStyle={{ width: 'auto', minWidth: 120, paddingHorizontal: 12 }}
        renderLabel={({
          route,
          focused,
          color,
        }: {
          route: PaymentTabRoute;
          focused: boolean;
          color: string;
        }) => <Text style={[styles.tabLabel, { color }]}>{route.title}</Text>}
      />
    ),
    [tabRoutes.length]
  );

  // --- Renderização Condicional (Loading / Erro) ---
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors.background },
        ]}
      >
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
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors.background },
        ]}
      >
        <Stack.Screen
          options={{
            title: 'Erro',
            headerTintColor: Colors.text,
            headerBackTitle: '',
          }}
        />
        <Text style={styles.errorText}>Pagamento não encontrado.</Text>
        <AppButton
          title='Voltar para Lista'
          onPress={() => router.back()}
          variant='primary'
          style={{ minWidth: 150 }}
        />
      </View>
    );
  }

  // --- Renderização Principal ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <Stack.Screen
        options={{
          title: `Pagamento #${id ? id.substring(0, 6) : 'Novo'}...`,
          headerTintColor: Colors.text,
          headerBackTitle: '',
        }}
      />
      <Text style={styles.title /* Usei o estilo que sugeri para título */}>
        Detalhes da Requisição
      </Text>

      <TabView
        navigationState={{ index: tabIndex, routes: tabRoutes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={{ flex: 1 }}
        lazy
      />

      {paymentDetails.status === PaymentStatus.PENDING && (
        <PaymentActionButtons
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
          isLoading={false}
        />
      )}

      <RejectionModal
        isVisible={isRejectModalVisible}
        payeeName={paymentDetails?.payee || ''}
        onClose={() => setIsRejectModalVisible(false)}
        onSubmit={handleConfirmRejection}
      />

      {/* Renderiza o HistoryModal, passando as props necessárias */}
      {paymentDetails && (
        <HistoryModal
          isVisible={isPayeeHistoryModalVisible}
          onClose={() => setIsPayeeHistoryModalVisible(false)}
          payeeName={paymentDetails.payee}
          currentPaymentId={paymentDetails.id} // Passa o ID atual
          historyData={paymentHistoryForModal} // Passa os dados FORMATADOS pelo handler
        />
      )}
    </KeyboardAvoidingView>
  );
}
