import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
    rejectPayment(paymentDetails.id);
    Alert.alert(
      'Rejeitado',
      `Pagamento para ${paymentDetails.payee} rejeitado.`
    );
    router.back();
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
        <View style={styles.buttonContainer}>
          <Button
            title='Cancelar'
            onPress={handleCancel}
            color={Colors.textMuted}
          />
          <Button
            title='Rejeitar'
            onPress={handleReject}
            color={Colors.error}
          />
          <Button
            title='Aprovar'
            onPress={handleApprove}
            color={Colors.success}
          />
        </View>
      )}
    </ScrollView>
  );
}
