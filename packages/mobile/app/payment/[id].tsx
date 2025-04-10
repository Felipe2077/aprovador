import AppButton from '@/components/AppButton';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getTextColorForVariant } from '../../components/AppButton/AppButton.styles'; //
import Colors from '../../constants/Colors';
import { formatCurrency } from '../../constants/formatCurrency';
import { Payment } from '../../constants/Payment';
import { usePaymentStore } from '../../store/paymentStore';
import styles from '../../styles/screens/[id].styles';

/**
 * Tela de detalhes do pagamento.
 * Exibe informações detalhadas sobre um pagamento específico.
 * Permite aprovar, rejeitar ou cancelar o pagamento.
 */

interface HistoryItem {
  id: string;
  displayDate: string;
  formattedAmount: string;
}

export default function PaymentDetailScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<
    Payment | null | undefined
  >(undefined);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const approvePayment = usePaymentStore((state) => state.approvePayment);
  const rejectPayment = usePaymentStore((state) => state.rejectPayment);
  const cancelPayment = usePaymentStore((state) => state.cancelPayment);

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- ESTADOS PARA MODAL DE HISTÓRICO ---
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [paymentHistoryData, setPaymentHistoryData] = useState<HistoryItem[]>(
    []
  );

  const handleOpenHistoryModal = () => {
    if (!paymentDetails) return;

    console.log(`Abrindo histórico para payee: ${paymentDetails.payee}`);
    const allPayments = usePaymentStore.getState().payments;

    const history = allPayments
      .filter(
        (p) =>
          p.payee === paymentDetails.payee && // Mesmo fornecedor
          p.status === 'approved' && // Apenas aprovados (ou ajuste se quiser outros status)
          p.id !== paymentDetails.id // Exclui o próprio pagamento atual
      )
      .sort(
        (a, b) =>
          new Date(b.dueDate || b.createdAt).getTime() -
          new Date(a.dueDate || a.createdAt).getTime()
      ) // Ordena do mais recente para o mais antigo
      .map((p) => ({
        // Formata para exibição
        id: p.id,
        // Formata data para Mês/Ano (ex: 03/2025)
        displayDate: new Intl.DateTimeFormat('pt-BR', {
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(p.dueDate || p.createdAt)),
        formattedAmount: formatCurrency(p.amount, p.currency),
      }));

    console.log('Histórico encontrado:', history);
    setPaymentHistoryData(history);
    setIsHistoryModalVisible(true); // Abre o modal
  };

  useEffect(() => {
    setLoading(true);
    setPaymentDetails(undefined);
    console.log(`Buscando detalhes para ID: ${id}`);
    const timer = setTimeout(() => {
      const foundPayment = usePaymentStore
        .getState()
        .payments.find((p) => p.id === id);
      console.log(
        'Busca concluída, pagamento encontrado:',
        foundPayment ? foundPayment.id : 'Nenhum'
      );
      setPaymentDetails(foundPayment || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleApprove = () => {
    if (!paymentDetails) return;
    approvePayment(paymentDetails.id);
    Alert.alert('Sucesso', `Pagamento para ${paymentDetails.payee} aprovado!`);
    router.back();
  };

  const handleReject = () => {
    if (!paymentDetails) return;
    console.log('Reject button pressed, opening modal...');
    setRejectionReason(''); // Limpa o motivo anterior
    setIsRejectModalVisible(true); // Abre o modal
    // Não chama rejectPayment(id) nem router.back() aqui!
  };

  const handleConfirmRejection = () => {
    if (!paymentDetails) return;

    // Apenas para demonstração: loga o motivo, fecha modal, alerta e navega
    console.log(
      `Rejeitando pagamento ${paymentDetails.id} com motivo: ${rejectionReason}`
    );

    // TODO - Na Fase 3: Chamar a ação da store passando o motivo
    // rejectPayment(paymentDetails.id, rejectionReason);

    setIsRejectModalVisible(false); // Fecha o modal
    Alert.alert(
      'Rejeitado',
      `Pagamento para ${paymentDetails.payee} rejeitado (motivo simulado).`
    ); // Feedback
    router.back(); // Volta para a lista
  };

  const handleCancel = () => {
    if (!paymentDetails) return;
    // Futuramente: pedir motivo do cancelamento aqui
    cancelPayment(paymentDetails.id); // Chama a ação da store
    Alert.alert(
      'Cancelado',
      `Pagamento para ${paymentDetails.payee} cancelado com sucesso.`
    );
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Carregando...' }} />
        <ActivityIndicator size='large' />
        <Text style={styles.loadingText}>Buscando detalhes...</Text>
      </View>
    );
  }

  if (!paymentDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Erro' }} />
        <Text style={styles.errorText}>Pagamento não encontrado.</Text>
        <Button title='Voltar para Lista' onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      {/* ScrollView para o conteúdo principal */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps='handled' // Ajuda a fechar teclado ao tocar fora no Android
      >
        {/* Configura título dinâmico do header */}
        <Stack.Screen
          options={{
            title: `Pagamento ${paymentDetails.id}`,
            headerTintColor: Colors.text,
            headerBackTitle: '',
          }}
        />

        {/* Título da Página */}
        <Text style={styles.title}>Detalhes do Pagamento</Text>
        {/* Botão de Histórico (ex: perto do título ou dos botões de ação) */}
        <TouchableOpacity
          onPress={handleOpenHistoryModal}
          style={styles.historyButton}
        >
          <FontAwesome name='history' size={18} color={Colors.primary} />
          <Text style={styles.historyButtonText}>Ver Histórico</Text>
        </TouchableOpacity>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='person-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Recebedor:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.payee}</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='cash-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Valor:</Text>
          </View>
          <Text style={[styles.value, styles.amountValue]}>
            {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='person-circle-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Solicitante:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.requester}</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='calendar-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Vencimento:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.dueDate || 'N/A'}</Text>
        </View>
        {paymentDetails.description && (
          <View style={styles.detailItem}>
            <View style={styles.labelContainer}>
              <Ionicons
                name='document-text-outline'
                size={18}
                color={Colors.textSecondary}
                style={styles.labelIcon}
              />
              <Text style={styles.label}>Descrição:</Text>
            </View>
            <Text style={styles.value}>{paymentDetails.description}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='information-circle-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Status Atual:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.status}</Text>
        </View>

        {/* Botões de Ação (Apenas se pendente) */}
        {paymentDetails.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <AppButton
              title='Cancelar'
              onPress={handleCancel}
              variant='danger'
              iconLeft={
                <Ionicons
                  name='close-circle-outline'
                  size={20}
                  color={getTextColorForVariant('danger')}
                />
              }
              disabled={loading} // Usa o estado de loading da TELA aqui
            />
            <AppButton
              title='Rejeitar'
              onPress={handleReject} // Abre o modal
              variant='warning'
              iconLeft={
                <Ionicons
                  name='arrow-undo-outline'
                  size={20}
                  color={getTextColorForVariant('warning')}
                />
              }
              disabled={loading}
            />
            <AppButton
              title='Aprovar'
              onPress={handleApprove}
              variant='success'
              iconLeft={
                <Ionicons
                  name='thumbs-up-outline'
                  size={20}
                  color={getTextColorForVariant('success')}
                />
              }
              disabled={loading}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Rejeição */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={isRejectModalVisible}
        onRequestClose={() => setIsRejectModalVisible(false)}
      >
        <KeyboardAvoidingView // Adiciona KAV aqui também para o input no modal
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalCenteredView} // Usa o estilo que centraliza e escurece
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Motivo da Rejeição</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder='Digite o motivo aqui...'
              placeholderTextColor={Colors.textMuted}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline={true}
              numberOfLines={4}
            />
            <View style={styles.modalButtonContainer}>
              <AppButton
                title='Cancelar'
                onPress={() => setIsRejectModalVisible(false)}
                variant='muted' // Ou 'default'
                style={{ flex: 1, marginRight: 5 }} // Estilo para ajustar largura
              />
              <AppButton
                title='Confirmar'
                onPress={handleConfirmRejection}
                variant='danger' // Ou 'warning'? Mantendo danger por ora
                style={{ flex: 1, marginLeft: 5 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* --- NOVO Modal de Histórico --- */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={isHistoryModalVisible}
        onRequestClose={() => setIsHistoryModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={[styles.modalView, styles.historyModalView]}>
            {' '}
            {/* Estilo customizado opcional */}
            <Text style={styles.modalTitle}>
              Histórico para: {paymentDetails.payee}
            </Text>
            {paymentHistoryData.length > 0 ? (
              <FlatList
                data={paymentHistoryData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.historyListItem}>
                    <Text style={styles.historyDate}>{item.displayDate}</Text>
                    <Text style={styles.historyAmount}>
                      {item.formattedAmount}
                    </Text>
                  </View>
                )}
                style={{ width: '100%' }} // Garante que FlatList use a largura
              />
            ) : (
              <Text style={styles.historyEmptyText}>
                Nenhum histórico encontrado.
              </Text>
            )}
            {/* Botão Fechar */}
            <AppButton
              title='Fechar'
              onPress={() => setIsHistoryModalVisible(false)}
              variant='muted' // Ou 'primary'
              style={{ marginTop: 20, width: '60%' }} // Estilo para ajustar
            />
          </View>
        </View>
      </Modal>
      {/* --- Fim do Modal Histórico --- */}
    </KeyboardAvoidingView>
  );
}
