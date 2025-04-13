// packages/mobile/app/payment/[id].tsx
// Versão Completa com TabView Estrutural

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  TabBarLabelProps,
  TabBarProps,
  TabView,
} from 'react-native-tab-view'; // Imports do TabView
import PaymentDetailCard from '../../components/PaymentDetailCard'; // <--- Importe o novo componente

// Imports do Projeto (Verifique os Caminhos!)
import PaymentActionButtons from '@/components/PaymentActionButtons'; // <--- Importe o novo componente
import { Payment, PaymentStatus } from 'shared-types'; // Tipos compartilhados
import AppButton from '../../components/AppButton';
import RejectionModal from '../../components/RejectionModal';
import Colors from '../../constants/Colors';
import { usePaymentStore } from '../../store/paymentStore'; // Store de Pagamentos (apenas para ações)
import styles from '../../styles/screens/[id].styles'; // Estilos desta tela

// Define o tipo para as rotas das abas
type PaymentTabRoute = Route & {
  key: 'details' | 'history' | 'flow' | 'attachments';
};

export default function PaymentDetailScreen() {
  // --- Hooks ---
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useWindowDimensions();

  // Ações da store Zustand
  const approvePayment = usePaymentStore((state) => state.approvePayment);
  const rejectPayment = usePaymentStore((state) => state.rejectPayment); // Ação real (usaremos na Fase 3)
  const cancelPayment = usePaymentStore((state) => state.cancelPayment);

  // --- Estados Locais ---
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<
    Payment | null | undefined
  >(undefined);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  // const [rejectionReason, setRejectionReason] = useState(''); // Movido para dentro do RejectionModal

  // Estado das Abas
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState<PaymentTabRoute[]>([
    { key: 'details', title: 'Detalhes' },
    { key: 'history', title: 'Histórico' },
    { key: 'flow', title: 'Fluxo' },
    { key: 'attachments', title: 'Anexos' },
  ]);

  // --- Mocks Temporários para Placeholders ---
  // (Estes sairão quando criarmos os componentes das abas e passarmos dados reais)
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
  // -------------------------------------------

  // --- Efeito para Buscar Dados ---
  useEffect(() => {
    setLoading(true);
    setPaymentDetails(undefined);
    const timer = setTimeout(() => {
      const foundPayment = usePaymentStore
        .getState()
        .payments.find((p) => p.id === id);
      setPaymentDetails(foundPayment || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  // --- Handlers de Ação ---
  const handleApprove = () => {
    if (!paymentDetails) return;
    approvePayment(paymentDetails.id);
    Alert.alert('Sucesso', `Pagamento para ${paymentDetails.payee} aprovado!`);
    router.back();
  };
  const handleReject = () => {
    if (!paymentDetails) return;
    setIsRejectModalVisible(true);
  };
  const handleCancel = () => {
    if (!paymentDetails) return;
    cancelPayment(paymentDetails.id);
    Alert.alert(
      'Cancelado',
      `Pagamento para ${paymentDetails.payee} cancelado.`
    );
    router.back();
  };
  const handleConfirmRejection = (reasonFromModal: string) => {
    if (!paymentDetails) return;
    console.log(
      `CONFIRMANDO Rejeição para ${paymentDetails.id}. Motivo: ${reasonFromModal}`
    );
    // TODO - Fase 3: Chamar rejectPayment(paymentDetails.id, reasonFromModal);
    setIsRejectModalVisible(false);
    Alert.alert(
      'Rejeitado',
      `Pagamento para ${paymentDetails.payee} rejeitado (motivo simulado).`
    );
    router.back();
  };

  // --- Render Scene e TabBar ---
  // Placeholders - serão substituídos por componentes reais depois
  const DetailsTab = () => (
    // Use ScrollView aqui pois o conteúdo pode crescer
    <ScrollView
      style={styles.tabSceneContainer}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Renderiza o card de detalhes passando os dados */}
      <PaymentDetailCard payment={paymentDetails!} />
      {/* O '!' acima assume que paymentDetails não será null/undefined aqui,
             pois já tratamos esses casos antes de renderizar o TabView.
             Se preferir, pode adicionar uma verificação:
             {paymentDetails && <PaymentDetailCard payment={paymentDetails} />} */}

      {/* TODO: Adicionar os componentes ApprovalFlow e AttachmentList aqui depois */}
      <View style={{ marginTop: 30 }}>
        <Text style={styles.placeholderText}>
          [Placeholder Fluxo Aprovação]
        </Text>
      </View>
      <View style={{ marginTop: 30 }}>
        <Text style={styles.placeholderText}>[Placeholder Anexos]</Text>
      </View>
    </ScrollView>
  );
  const HistoryTab = () => (
    <View style={styles.tabSceneContainer}>
      <Text style={styles.placeholderText}>[HISTÓRICO DE CONVERSA]</Text>
      {/* Renderizar mocks aqui dentro se quiser, mas o container é View */}
      {/* {mockComments.map(c => <Text key={c.id} style={{color: Colors.text}}>{c.text}</Text>)} */}
    </View>
  );
  const FlowTab = () => (
    <View style={styles.tabSceneContainer}>
      <Text style={styles.placeholderText}>[FLUXO DE APROVAÇÃO]</Text>
      {/* {mockApprovalSequence.map(a => <Text key={a.id} style={{color: Colors.text}}>{a.name} ({a.status})</Text>)} */}
    </View>
  );
  const AttachmentsTab = () => (
    <View style={styles.tabSceneContainer}>
      <Text style={styles.placeholderText}>[LISTA DE ANEXOS]</Text>
      {/* {mockAttachments.map(a => <Text key={a.id} style={{color: Colors.text}}>{a.name}</Text>)} */}
    </View>
  );

  // SceneMap continua usando essas funções
  const renderScene = SceneMap({
    details: DetailsTab,
    history: HistoryTab,
    flow: FlowTab,
    attachments: AttachmentsTab,
  });

  const renderTabBar = (
    props: TabBarProps<PaymentTabRoute> // Use o tipo que definimos
  ) => (
    <TabBar
      {...props} // Passa todas as props necessárias adiante
      indicatorStyle={{ backgroundColor: Colors.primary }}
      style={{ backgroundColor: Colors.card }}
      activeColor={Colors.primary} // Cor ATIVA do texto/ícone da aba
      inactiveColor={Colors.textMuted} // Cor INATIVA do texto/ícone da aba
      scrollEnabled={true} // Permite scroll
      tabStyle={{ width: 'auto', minWidth: 90, paddingHorizontal: 4 }} // Estilo do container de CADA aba
      // --- ADICIONE A PROP renderLabel ---
      renderLabel={(
        { route, focused, color }: TabBarLabelProps<PaymentTabRoute> // <--- TIPO ADICIONADO
      ) => <Text style={[styles.tabLabel, { color }]}>{route.title}</Text>}
      // ------------------------------------
    />
  );

  // --- Renderização Condicional (Loading / Erro) ---
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen
          options={{
            title: 'Carregando...',
            headerTintColor: Colors.text,
            headerBackTitle: '',
          }}
        />
        <ActivityIndicator size='large' color={Colors.primary} />
        <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
          Buscando detalhes...
        </Text>
      </View>
    );
  }
  if (!paymentDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
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
        />
      </View>
    );
  }

  // --- Renderização Principal (Caso de Sucesso com TabView) ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // Removi o View wrapper interno que testamos antes, vamos ver se KAV direto funciona
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      {/* Header */}
      <Stack.Screen
        options={
          {
            /* ... */
          }
        }
      />

      {/* Título */}
      <Text style={styles.title}>Detalhes do Pagamento</Text>

      {/* TabView ocupando o espaço flexível */}
      <TabView
        navigationState={{ index: tabIndex, routes: tabRoutes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={{ flex: 1 }} // <-- MUITO IMPORTANTE
      />

      {/* Botões de Ação (RENDERIZA O NOVO COMPONENTE AQUI) */}
      {/* Renderiza apenas se pendente */}
      {paymentDetails.status === PaymentStatus.PENDING && (
        <PaymentActionButtons
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
          isLoading={loading} // Passa o estado de loading da tela
        />
      )}

      {/* Modal de Rejeição (mantém aqui fora) */}
      <RejectionModal
        isVisible={isRejectModalVisible}
        payeeName={paymentDetails?.payee || ''}
        onClose={() => setIsRejectModalVisible(false)}
        onSubmit={handleConfirmRejection}
      />
    </KeyboardAvoidingView>
  );
}
