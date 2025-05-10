// components/PaymentListItem.tsx
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Payment } from 'shared-types';
import { formatCurrency } from '../../constants/formatCurrency'; // Ajuste o caminho
import styles from './PaymentListItem.styles'; // Caminho relativo dentro da mesma pasta

interface PaymentListItemProps {
  payment: Payment;
}

interface DueDateInfo {
  barColor: string; // Cor da barra lateral esquerda
  badgeBackgroundColor: string;
  badgeTextColor: string;
  badgeLabel: string;
  badgeIconName: keyof typeof Ionicons.glyphMap | null; // Ícone para o badge
}

// --- FUNÇÃO HELPER PARA DETERMINAR A COR DA FAIXA ---
const getDueDateInfo = (
  dueDate: string | Date | null | undefined
  // paymentIdForLog: string // Removido logs para limpar
): DueDateInfo => {
  const defaultReturn = {
    barColor: Colors.textMuted,
    badgeBackgroundColor: Colors.textMuted, // Uma cor neutra para o fundo do badge
    badgeTextColor: Colors.background, // Texto que contrasta com textMuted
    badgeLabel: 'Sem Data',
    badgeIconName: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
  };

  if (!dueDate) return defaultReturn;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueDateObj: Date;
  if (typeof dueDate === 'string') {
    const parts = dueDate.split('-');
    if (parts.length === 3) {
      dueDateObj = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
    } else {
      dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
    }
  } else {
    dueDateObj = new Date(dueDate.getTime());
    dueDateObj.setHours(0, 0, 0, 0);
  }

  if (isNaN(dueDateObj.getTime())) {
    return { ...defaultReturn, badgeLabel: 'Data Inv.' };
  }

  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const formattedDueDateShort = dueDateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }); // DD/MM

  if (diffDays < 0) {
    return {
      // Vencido
      barColor: Colors.dangerText,
      badgeBackgroundColor: Colors.error, // Fundo vermelho
      badgeTextColor: Colors.dangerText, // Texto contrastante (ex: branco ou um vermelho claro se o fundo for escuro)
      badgeLabel: `Vencido ${formattedDueDateShort}`,
      badgeIconName: 'alert-circle-outline',
    };
  } else if (diffDays === 0) {
    // Vence Hoje
    return {
      barColor: Colors.warningText,
      badgeBackgroundColor: Colors.warning, // Fundo laranja/amarelo
      badgeTextColor: Colors.warningText, // Texto contrastante
      badgeLabel: 'Vence Hoje',
      badgeIconName: 'warning-outline',
    };
  } else if (diffDays === 1) {
    // Vence Amanhã
    return {
      barColor: Colors.warning, // Ainda é próximo
      // Usar uma cor mais informativa/neutra para "Vence amanhã"
      badgeBackgroundColor: Colors.warning || Colors.textMuted, // Defina Colors.infoBackground
      badgeTextColor: Colors.warningText || Colors.text, // Defina Colors.infoText
      badgeLabel: 'Vence Amanhã',
      badgeIconName: 'information-circle-outline',
    };
  } else if (diffDays <= 7) {
    // Vence nesta semana (ex: até 7 dias)
    return {
      barColor: Colors.successText, // Já não é tão urgente, pode ser verde
      badgeBackgroundColor: Colors.success, // Fundo verde
      badgeTextColor: Colors.successText, // Texto contrastante
      badgeLabel: `Vence ${formattedDueDateShort}`, // Ou "Em X dias"
      badgeIconName: 'calendar-outline',
    };
  } else {
    // Longe de vencer
    return {
      barColor: Colors.successText,
      badgeBackgroundColor: Colors.success || Colors.card2, // Um verde mais sutil ou cor de card
      badgeTextColor: Colors.successText || Colors.textSecondary, // Defina essas cores
      badgeLabel: `Vence ${formattedDueDateShort}`,
      badgeIconName: 'calendar-outline',
    };
  }
};
// ---------------------------------------------------

export default function PaymentListItem({ payment }: PaymentListItemProps) {
  const {
    barColor,
    badgeBackgroundColor,
    badgeTextColor,
    badgeLabel,
    badgeIconName,
  } = getDueDateInfo(payment.dueDate);

  return (
    <Link href={`/payment/${payment.id}`} asChild>
      <TouchableOpacity style={styles.itemOuterContainer}>
        <View
          style={[styles.dueDateIndicator, { backgroundColor: barColor }]}
        />
        {/* Agora a variável existe */}
        <View style={styles.itemContentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.payee}>{payment.payee} </Text>
            <Text style={styles.requester}>
              Solicitado por: {payment.requesterId}
            </Text>
            <Text style={styles.dueDate}>
              Vencimento:{' '}
              {payment.dueDate
                ? new Date(payment.dueDate + 'T12:00:00').toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }
                  )
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              {formatCurrency(payment.amount, payment.currency)}
            </Text>
          </View>
        </View>
        {/* NOVO BADGE DE VENCIMENTO */}
        {badgeLabel && ( // Só renderiza se tiver um label
          <View
            style={[
              styles.dueDateBadge,
              { backgroundColor: badgeBackgroundColor },
            ]}
          >
            {badgeIconName && (
              <Ionicons
                name={badgeIconName}
                size={12} // Ícone pequeno para o badge
                color={badgeTextColor}
                style={styles.badgeIcon}
              />
            )}
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {badgeLabel}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Link>
  );
}
