// packages/mobile/components/HistoryModal/index.tsx
// VERSÃO COMPLETA COM DESTAQUE MIN/MAX E COMPARAÇÃO INDIVIDUAL

import { formatCurrency } from '@/constants/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, ListRenderItemInfo, Modal, Text, View } from 'react-native'; // Adicionado StyleSheet, ListRenderItemInfo
import { HistoryItem } from 'shared-types';
import Colors from '../../constants/Colors';
import AppButton from '../AppButton';
import styles from './HistoryModal.styles'; // Seus estilos locais

// Interface para o item formatado INTERNAMENTE, incluindo destaque min/max
interface DisplayHistoryItemInternal extends HistoryItem {
  isMin?: boolean; // Flag para indicar se é o valor mínimo no histórico exibido
  isMax?: boolean; // Flag para indicar se é o valor máximo no histórico exibido
}

// Props que o Modal de Histórico realmente precisa
interface HistoryModalProps {
  isVisible: boolean;
  payeeName: string;
  historyData: HistoryItem[]; // Dados JÁ PROCESSADOS (sem o pagamento atual)
  currentPaymentAmount: number;
  currentPaymentCurrency: string;
  onClose: () => void;
  currentPaymentId: string;
}

const AVERAGE_HISTORY_LIMIT = 6; // Limite para cálculo da média

export default function HistoryModal({
  isVisible,
  payeeName,
  historyData,
  currentPaymentAmount,
  currentPaymentCurrency,
  onClose,
}: HistoryModalProps) {
  // Memo para calcular o sumário (média, comparação com atual)
  const summaryStats = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return {
        averageAmount: null,
        comparisonText: 'Sem dados suficientes para comparação.',
        comparisonColor: Colors.textMuted,
        comparisonIconName: null,
      };
    }
    const recentHistory = historyData.slice(0, AVERAGE_HISTORY_LIMIT);
    const sum = recentHistory.reduce((acc, item) => acc + item.rawAmount, 0);
    const avg = sum / recentHistory.length;
    const diff = ((currentPaymentAmount - avg) / avg) * 100;

    let text = '';
    let color = Colors.text;
    let iconName: keyof typeof Ionicons.glyphMap | null = null;

    if (isNaN(diff)) {
      // Caso avg seja 0 ou currentPaymentAmount não seja número válido
      text = 'Não foi possível comparar.';
      color = Colors.textMuted;
    } else if (Math.abs(diff) < 5) {
      text = `~ ${diff.toFixed(0)}% (Estável)`;
      color = Colors.textMuted;
      iconName = 'remove-outline';
    } else if (diff > 0) {
      text = `${diff.toFixed(0)}% mais caro`;
      color = Colors.dangerText;
      iconName = 'arrow-up-circle-outline';
    } else {
      text = `${Math.abs(diff).toFixed(0)}% mais barato`;
      color = Colors.successText;
      iconName = 'arrow-down-circle-outline';
    }
    return {
      averageAmount: avg,
      comparisonText: text,
      comparisonColor: color,
      comparisonIconName: iconName,
    };
  }, [historyData, currentPaymentAmount]);

  // Memo para preparar dados da lista com DESTAQUES MIN/MAX
  const listDataWithHighlights = useMemo((): DisplayHistoryItemInternal[] => {
    if (!historyData || historyData.length === 0) return [];

    let minAmount = Infinity;
    let maxAmount = -Infinity;
    let minId: string | null = null;
    let maxId: string | null = null;

    historyData.forEach((item) => {
      if (item.rawAmount < minAmount) {
        minAmount = item.rawAmount;
        minId = item.id;
      }
      if (item.rawAmount > maxAmount) {
        maxAmount = item.rawAmount;
        maxId = item.id;
      }
    });

    // Se min e max forem iguais (ex: só 1 item ou todos iguais), não destaca
    if (minAmount === maxAmount && historyData.length > 1) {
      minId = null;
      maxId = null;
    }
    if (historyData.length <= 1) {
      // Se só tem um item, não é nem min nem max relativo a outros
      minId = null;
      maxId = null;
    }

    return historyData.map((item) => ({
      ...item, // Propriedades de HistoryItem (id, displayDate, formattedAmount, rawAmount, currency)
      isMin: item.id === minId,
      isMax: item.id === maxId,
    }));
  }, [historyData]);

  // Função para renderizar cada item na FlatList
  const renderHistoryItem = ({
    item,
  }: ListRenderItemInfo<DisplayHistoryItemInternal>) => {
    // Comparação do item histórico com o pagamento ATUAL (LÓGICA QUE VOCÊ JÁ TINHA)
    let itemComparisonText = '';
    let itemComparisonColor = Colors.textMuted;
    let itemComparisonIcon: keyof typeof Ionicons.glyphMap | null = null;

    if (currentPaymentAmount && typeof item.rawAmount === 'number') {
      const diff =
        ((item.rawAmount - currentPaymentAmount) / currentPaymentAmount) * 100;
      if (isNaN(diff)) {
        itemComparisonText = '-'; // Não pode comparar
      } else if (Math.abs(diff) < 5) {
        itemComparisonText = `~ ${diff.toFixed(0)}%`;
        itemComparisonIcon = 'remove-circle-outline';
        itemComparisonColor = Colors.textMuted;
      } else if (item.rawAmount > currentPaymentAmount) {
        itemComparisonText = `↑ ${diff.toFixed(0)}%`;
        itemComparisonIcon = 'arrow-up-circle-outline';
        itemComparisonColor = Colors.dangerText;
      } else {
        itemComparisonText = `↓ ${Math.abs(diff).toFixed(0)}%`;
        itemComparisonIcon = 'arrow-down-circle-outline';
        itemComparisonColor = Colors.successText;
      }
    }

    // Define o estilo do valor baseado se é min ou max no histórico
    let amountSpecificStyle = {};
    if (item.isMin) amountSpecificStyle = styles.minAmountText; // Só min
    if (item.isMax) amountSpecificStyle = styles.maxAmountText; // Só max (sobrescreve min se for o mesmo item)
    // Se min e max forem o mesmo valor e não quisermos destacar, a lógica do useMemo acima já trata isso.

    return (
      <View style={styles.historyListItem}>
        <View style={styles.historyItemMain}>
          <Text style={styles.historyDate}>{item.displayDate}</Text>
          {/* Aplica o estilo de destaque ao valor do item da lista */}
          <Text style={[styles.historyAmount, amountSpecificStyle]}>
            {item.formattedAmount}
          </Text>
        </View>
        {/* Mostra a comparação individual com o pagamento ATUAL */}
        {itemComparisonText && (
          <View style={styles.itemComparisonContainer}>
            {itemComparisonIcon && (
              <Ionicons
                name={itemComparisonIcon}
                size={16}
                color={itemComparisonColor}
                style={styles.itemComparisonIcon}
              />
            )}
            <Text
              style={[
                styles.itemComparisonText,
                { color: itemComparisonColor },
              ]}
            >
              {itemComparisonText}
            </Text>
          </View>
        )}
      </View>
    );
  };

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

          {/* Seção de Sumário (média e comparação com atual) */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Pagamento Atual:{' '}
              {formatCurrency(currentPaymentAmount, currentPaymentCurrency)}
            </Text>
            {summaryStats.averageAmount !== null && (
              <Text style={styles.summaryText}>
                Média dos últimos{' '}
                {Math.min(historyData.length, AVERAGE_HISTORY_LIMIT)}:{' '}
                {formatCurrency(
                  summaryStats.averageAmount,
                  currentPaymentCurrency
                )}
              </Text>
            )}
            <View style={styles.comparisonLine}>
              {summaryStats.comparisonIconName && (
                <Ionicons
                  name={summaryStats.comparisonIconName}
                  size={18}
                  color={summaryStats.comparisonColor}
                  style={styles.comparisonIcon}
                />
              )}
              <Text
                style={[
                  styles.summaryText,
                  styles.comparisonText,
                  { color: summaryStats.comparisonColor },
                ]}
              >
                {summaryStats.comparisonText}
              </Text>
            </View>
          </View>

          {/* Lista de Histórico com Destaques Min/Max */}
          {listDataWithHighlights && listDataWithHighlights.length > 0 ? (
            <View style={styles.historyListContainer}>
              <FlatList<DisplayHistoryItemInternal> // Especifica o tipo do item
                data={listDataWithHighlights} // Usa os dados com flags min/max
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          ) : (
            <Text style={styles.historyEmptyText}>
              Nenhum histórico de pagamento aprovado encontrado.
            </Text>
          )}

          {/* Botão Fechar */}
          <View style={styles.closeButtonContainer}>
            <AppButton
              title='Fechar'
              onPress={onClose}
              variant='primary' // Fundo amarelo, texto escuro
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
