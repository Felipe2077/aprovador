// packages/mobile/components/HistoryModal/index.tsx
import Colors from '@/constants/Colors';
import { formatCurrency } from '@/constants/formatCurrency';
import React, { useMemo } from 'react';
import { FlatList, Modal, Text, View } from 'react-native';
import { HistoryItem } from 'shared-types';
import AppButton from '../AppButton';
import styles from './HistoryModal.styles'; // Estilos locais

// Props que o Modal de Histórico receberá
interface HistoryModalProps {
  isVisible: boolean;
  payeeName: string;
  historyData: HistoryItem[]; // Dados já processados
  currentPaymentAmount: number; // Valor do pagamento atual
  currentPaymentCurrency: string; // Moeda do pagamento atual
  onClose: () => void;
}

// Limite de pagamentos para calcular a média (ex: últimos 6)
const AVERAGE_HISTORY_LIMIT = 6;

export default function HistoryModal({
  isVisible,
  payeeName,
  historyData,
  currentPaymentAmount,
  currentPaymentCurrency,
  onClose,
}: HistoryModalProps) {
  const { averageAmount, percentageDiff, comparisonText, comparisonColor } =
    useMemo(() => {
      if (!historyData || historyData.length === 0) {
        return {
          averageAmount: null,
          percentageDiff: null,
          comparisonText: 'Sem dados suficientes para comparação.',
          comparisonColor: Colors.textMuted,
        };
      }

      // Pega os últimos X pagamentos para a média
      const recentHistory = historyData.slice(0, AVERAGE_HISTORY_LIMIT);
      const sum = recentHistory.reduce((acc, item) => acc + item.rawAmount, 0);
      const avg = sum / recentHistory.length;

      const diff = ((currentPaymentAmount - avg) / avg) * 100;

      let text = '';
      let color = Colors.text; // Cor padrão (branco/texto normal)

      if (Math.abs(diff) < 5) {
        // Ex: até 5% de diferença é "estável"
        text = `~ ${diff.toFixed(0)}% (Estável)`;
        color = Colors.textMuted; // Ou um cinza/verde claro
      } else if (diff > 0) {
        // Mais caro
        text = `↑ ${diff.toFixed(0)}% mais caro`;
        color = Colors.error; // Vermelho para mais caro
      } else {
        // Mais barato
        text = `↓ ${Math.abs(diff).toFixed(0)}% mais barato`;
        color = Colors.success; // Verde para mais barato
      }
      return {
        averageAmount: avg,
        percentageDiff: diff,
        comparisonText: text,
        comparisonColor: color,
      };
    }, [historyData, currentPaymentAmount]);
  // Função para renderizar cada item na FlatList
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyListItem}>
      <Text style={styles.historyDate}>{item.displayDate}</Text>
      <Text style={styles.historyAmount}>{item.formattedAmount}</Text>
    </View>
  );

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Histórico para: {payeeName}</Text>

          {/* --- SEÇÃO DE SUMÁRIO --- */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Pagamento Atual:{' '}
              {formatCurrency(currentPaymentAmount, currentPaymentCurrency)}
            </Text>
            {averageAmount !== null && (
              <Text style={styles.summaryText}>
                Média dos últimos{' '}
                {Math.min(historyData.length, AVERAGE_HISTORY_LIMIT)}:{' '}
                {formatCurrency(averageAmount, currentPaymentCurrency)}
              </Text>
            )}
            <Text
              style={[
                styles.summaryText,
                styles.comparisonText,
                { color: comparisonColor },
              ]}
            >
              {comparisonText}
            </Text>
          </View>
          {/* ----------------------- */}

          {historyData && historyData.length > 0 ? (
            <View style={styles.historyListContainer}>
              <FlatList
                data={historyData}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          ) : (
            <Text style={styles.historyEmptyText}>
              Nenhum histórico de pagamento aprovado encontrado.
            </Text>
          )}

          <View style={styles.closeButtonContainer}>
            <AppButton title='Fechar' onPress={onClose} variant='primary' />
          </View>
        </View>
      </View>
    </Modal>
  );
}
