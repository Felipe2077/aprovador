import AppButton from '@/components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
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

        {/* Seção de Detalhes */}
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
    </KeyboardAvoidingView>
  );
}
