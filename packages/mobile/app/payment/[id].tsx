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
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Stack.Screen options={{ title: `Pagamento ${paymentDetails.id}` }} />
      <Text style={styles.title}>Detalhes do Pagamento</Text>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Recebedor:</Text>
        <Text style={styles.value}>{paymentDetails.payee}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.label}>Valor:</Text>
        <Text style={[styles.value, styles.amountValue]}>
          {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
        </Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Solicitante:</Text>
        <Text style={styles.value}>{paymentDetails.requester}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.label}>Vencimento:</Text>
        <Text style={styles.value}>{paymentDetails.dueDate}</Text>
      </View>
      {paymentDetails.description && (
        <View style={styles.detailItem}>
          <Text style={styles.label}>Descrição:</Text>
          <Text style={styles.value}>{paymentDetails.description}</Text>
        </View>
      )}
      <View style={styles.detailItem}>
        <Text style={styles.label}>Status Atual:</Text>
        <Text style={styles.value}>{paymentDetails.status}</Text>
      </View>

      {paymentDetails.status === 'pending' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: Colors.background }} // Cor de fundo geral
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
          >
            <Stack.Screen
              options={{
                title: `Pagamento ${paymentDetails.id}`,
                headerTintColor: Colors.text,
              }}
            />
            <Text style={styles.title}>Detalhes do Pagamento</Text>
            {paymentDetails.status === 'pending' && (
              <View style={styles.buttonContainer}>
                <AppButton
                  title='Cancelar'
                  onPress={handleCancel}
                  variant='danger' // Usa a variante 'danger' (vermelha)
                  iconLeft={
                    <Ionicons
                      name='close-circle-outline'
                      size={20}
                      // Pega a cor do texto da variante 'danger' nos estilos
                      color={getTextColorForVariant('danger')}
                    />
                  }
                  disabled={loading}
                />
                <AppButton
                  title='Rejeitar'
                  onPress={handleReject} // Abre o modal
                  variant='warning' // Usa a variante 'warning' (laranja)
                  iconLeft={
                    // Escolha UM ícone e descomente:
                    <Ionicons
                      name='arrow-undo-outline'
                      size={20}
                      // Pega a cor do texto da variante 'warning'
                      color={getTextColorForVariant('warning')}
                    />
                    // <Ionicons name="warning-outline" size={20} color={styles.textWarning.color} />
                    // <Ionicons name="thumbs-down-outline" size={20} color={styles.textWarning.color} />
                  }
                  disabled={loading}
                />
                <AppButton
                  title='Aprovar'
                  onPress={handleApprove}
                  variant='success' // Usa a variante 'success' (verde)
                  iconLeft={
                    <Ionicons
                      name='thumbs-up-outline'
                      size={20}
                      // Pega a cor do texto da variante 'success'
                      color={getTextColorForVariant('success')}
                    />
                  }
                  disabled={loading}
                />
              </View>
            )}
          </ScrollView>

          {/* --- Modal de Rejeição --- */}
          <Modal
            animationType='fade' // ou "slide"
            transparent={true} // Para permitir fundo semi-transparente e centralizar
            visible={isRejectModalVisible}
            onRequestClose={() => {
              // Chamado ao pressionar o botão 'voltar' no Android
              setIsRejectModalVisible(false);
            }}
          >
            {/* View para centralizar e escurecer o fundo */}
            <View style={styles.modalCenteredView}>
              {/* View do conteúdo do modal */}
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Motivo da Rejeição</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder='Digite o motivo aqui...'
                  placeholderTextColor={Colors.textMuted}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline={true} // Permite múltiplas linhas
                  numberOfLines={4} // Sugestão de altura inicial
                />
                {/* Botões do Modal */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setIsRejectModalVisible(false)} // Botão Cancelar apenas fecha
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={handleConfirmRejection} // Botão Confirmar chama a nova função
                  >
                    <Text style={styles.modalButtonTextConfirm}>
                      Confirmar Rejeição
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* --- Fim do Modal --- */}
        </KeyboardAvoidingView>
      )}
    </ScrollView>
  );
}
