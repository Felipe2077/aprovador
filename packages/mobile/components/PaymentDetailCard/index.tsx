// packages/mobile/components/PaymentDetailCard/index.tsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Payment } from 'shared-types'; // Importe tipos do pacote compartilhado
import Colors from '../../constants/Colors'; // Importe Cores
import { formatCurrency } from '../../constants/formatCurrency'; // Ou de utils (VERIFICAR CAMINHO)
import AppButton from '../AppButton';
import styles from './PaymentDetailCard.styles'; // Importe estilos locais

// Helper de data (pode mover para utils/formatters.ts depois)
const formatDisplayDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    // Tenta criar data, funciona com Date ou string ISO
    const dateObj = new Date(date);
    // Verifica se é uma data válida após conversão
    if (isNaN(dateObj.getTime())) return 'Data Inválida';
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return 'Data Inválida'; // Captura outros erros de formatação
  }
};

interface PaymentDetailCardProps {
  payment: Payment; // Recebe o objeto de pagamento completo
  onViewPayeeHistory?: () => void;
}

export default function PaymentDetailCard({
  payment,
  onViewPayeeHistory,
}: PaymentDetailCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* Container para o botão de histórico, alinhado à direita */}
      {/* SÓ RENDERIZA O BOTÃO SE 'onViewPayeeHistory' FOR FORNECIDO */}
      {onViewPayeeHistory && (
        <View style={styles.cardHeaderActions}>
          <AppButton
            title='Histórico'
            onPress={onViewPayeeHistory} // Agora TS sabe que é uma função
            variant='link'
            iconLeft={
              <FontAwesome name='history' size={16} color={Colors.primary} />
            }
          />
        </View>
      )}
      {/* Item Recebedor */}
      <View style={styles.detailItem}>
        <View style={styles.labelContainer}>
          <Ionicons
            name='person-outline'
            size={18}
            color={Colors.textSecondary}
            style={styles.labelIcon}
          />
          <Text style={styles.label}>Favorecido:</Text>
        </View>
        {/* Torna o valor clicável se a função for passada */}
        {onViewPayeeHistory && (
          <Text style={styles.value} numberOfLines={1} ellipsizeMode='tail'>
            {payment.payee}
          </Text>
        )}
      </View>

      {/* Item Valor */}
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
          {formatCurrency(payment.amount, payment.currency)}
        </Text>
      </View>

      {/* Item Status */}
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
        {/* Poderíamos ter um componente Badge aqui depois, mas por enquanto texto */}
        <Text style={styles.value}>{payment.status}</Text>
      </View>

      {/* Item Vencimento */}
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
        {/* Usa a função de formatação */}
        <Text style={styles.value}>{formatDisplayDate(payment.dueDate)}</Text>
      </View>

      {/* Item Solicitante */}
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
        <Text style={styles.value}>
          {payment.requesterName || `ID: ${payment.requesterId}`}
        </Text>
      </View>

      {/* Item Departamento (se existir) */}
      {payment.requesterDepartment && (
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='business-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Departamento:</Text>
          </View>
          <Text style={styles.value}>{payment.requesterDepartment}</Text>
        </View>
      )}

      {/* Item Descrição (se existir) */}
      {payment.description && (
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
          <Text style={styles.value}>{payment.description}</Text>
        </View>
      )}

      {/* Adicione outros campos se necessário (createdAt, etc.) */}
    </View>
  );
}
