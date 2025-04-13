// packages/mobile/app/payment/[id].tsx

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Route,
  SceneMap,
  TabBar, // Usado em renderLabel
  TabBarProps,
  TabView,
} from 'react-native-tab-view';

// Imports do Projeto Mínimos Necessários
import RejectionModal from '@/components/RejectionModal'; // Modal de rejeição
import Colors from '@/constants/Colors'; // Cores
import { usePaymentStore } from '@/store/paymentStore'; // Apenas para actions do modal
import styles from '@/styles/screens/[id].styles'; // Estilos da tela (Verifique seu alias/caminho)
import { Payment } from 'shared-types'; // Tipos essenciais
// Remova imports de componentes não usados agora: AppButton, PaymentDetailCard, ApprovalFlow, AttachmentList, getTextColorForVariant

// Define o tipo para as rotas das abas (corrigido para 2 abas)
type PaymentTabRoute = Route & {
  key: 'details' | 'history';
};

export default function PaymentDetailScreen() {
  // --- Hooks ---
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useWindowDimensions();

  // --- Store Actions (Apenas as necessárias para o fluxo restante) ---
  const rejectPayment = usePaymentStore((state) => state.rejectPayment); // Mantido para o futuro do modal

  // --- Estados Locais ---
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<
    Payment | null | undefined
  >(undefined);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState<PaymentTabRoute[]>([
    { key: 'details', title: 'Detalhes' },
    { key: 'history', title: 'Histórico' },
  ]);

  // --- Efeito para Buscar Dados (Mantém) ---
  useEffect(() => {
    setLoading(true);
    setPaymentDetails(undefined);
    const timer = setTimeout(() => {
      // Busca simulada
      const foundPayment = usePaymentStore
        .getState()
        .payments.find((p) => p.id === id);
      setPaymentDetails(foundPayment || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  // --- Handlers (Apenas os relacionados ao modal de rejeição por enquanto) ---
  const handleReject = useCallback(() => {
    // Este handler seria chamado pelo botão 'Rejeitar' (removido temporariamente)
    if (!paymentDetails) return;
    setIsRejectModalVisible(true);
  }, [paymentDetails]);

  const handleConfirmRejection = useCallback(
    (reasonFromModal: string) => {
      if (!paymentDetails) return;
      console.log(
        `CONFIRMANDO Rejeição para ${paymentDetails.id}. Motivo: ${reasonFromModal}`
      );
      // TODO - Fase 3: rejectPayment(paymentDetails.id, reasonFromModal);
      setIsRejectModalVisible(false);
      Alert.alert(
        'Rejeitado',
        `Pagamento para ${paymentDetails.payee} rejeitado (motivo simulado).`
      );
      router.back();
    },
    [paymentDetails, rejectPayment, router]
  ); // Removido rejectPayment da dep

  // --- Render Scene e TabBar (MÍNIMOS com Placeholders) ---
  const DetailsPlaceholder = () => (
    <View style={styles.tabSceneContainer}>
      <Text style={styles.placeholderText}>ABA DETALHES</Text>
    </View>
  );

  const HistoryPlaceholder = () => (
    <View style={styles.tabSceneContainer}>
      <Text style={styles.placeholderText}>ABA HISTÓRICO</Text>
    </View>
  );

  const renderScene = SceneMap({
    details: DetailsPlaceholder,
    history: HistoryPlaceholder,
  });

  const renderTabBar = useCallback(
    (props: TabBarProps<PaymentTabRoute>) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: Colors.primary }}
        style={{ backgroundColor: Colors.card }}
        activeColor={Colors.primary}
        inactiveColor={Colors.textMuted}
        scrollEnabled={tabRoutes.length > 3}
        tabStyle={{ width: 'auto', minWidth: 100, paddingHorizontal: 12 }}
      />
    ),
    [tabRoutes.length]
  );

  // --- Renderização Condicional (Loading / Erro - SEM MUDANÇAS) ---
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
        {/* O botão AppButton foi removido dos imports principais, usando Button do RN aqui */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ color: Colors.textMuted }}>
            (Botão Voltar temporário)
          </Text>
        </View>
        <Button
          title='Voltar para Lista'
          onPress={() => router.back()}
          color={Colors.primary}
        />
      </View>
    );
  }

  // --- Renderização Principal MÍNIMA (Caso de Sucesso) ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      {/* Header */}
      <Stack.Screen
        options={{
          title: `Pagamento ${paymentDetails.id}`,
          headerTintColor: Colors.text,
          headerBackTitle: '',
        }}
      />

      {/* Título */}
      <Text style={styles.title}>Detalhes do Pagamento</Text>

      {/* TabView */}
      <TabView
        navigationState={{ index: tabIndex, routes: tabRoutes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={{ flex: 1 }} // Essencial
        lazy // Boa prática
      />

      {/* Botões de Ação REMOVIDOS desta versão mínima */}

      {/* Modal de Rejeição (mantém, mas sem botão para acionar agora) */}
      <RejectionModal
        isVisible={isRejectModalVisible}
        payeeName={paymentDetails?.payee || ''}
        onClose={() => setIsRejectModalVisible(false)}
        onSubmit={handleConfirmRejection}
      />
    </KeyboardAvoidingView>
  );
}
