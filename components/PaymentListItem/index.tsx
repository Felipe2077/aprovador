// components/PaymentListItem.tsx
import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatCurrency } from '../../constants/formatCurrency'; // Ajuste o caminho
import { Payment } from '../../constants/Payment';
import styles from './PaymentListItem.styles'; // Caminho relativo dentro da mesma pasta

interface PaymentListItemProps {
  payment: Payment;
}

export default function PaymentListItem({ payment }: PaymentListItemProps) {
  return (
    <Link href={`/payment/${payment.id}`} asChild>
      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.payee}>{payment.payee}</Text>
          <Text style={styles.requester}>
            Solicitado por: {payment.requester}
          </Text>
          <Text style={styles.dueDate}>Vencimento: {payment.dueDate}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatCurrency(payment.amount, payment.currency)}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
