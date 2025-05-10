// packages/mobile/components/HistoryModal/index.tsx
// VERSÃO COMPLETA COM GRÁFICO DE BARRAS E LIMITE DE 6 MESES

import { formatCurrency } from '@/constants/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Modal,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit'; // Importa o BarChart
import { HistoryItem as SharedHistoryItem } from 'shared-types';
import Colors from '../../constants/Colors';
import AppButton from '../AppButton';
import styles from './HistoryModal.styles'; // Seus estilos locais

// Interface para o item formatado INTERNAMENTE, incluindo destaque min/max
interface DisplayHistoryItemInternal extends SharedHistoryItem {
  isMin?: boolean;
  isMax?: boolean;
}

// Props que o Modal de Histórico realmente precisa
interface HistoryModalProps {
  isVisible: boolean;
  payeeName: string;
  historyData: SharedHistoryItem[]; // Array COMPLETO de histórico aprovado para o payee (sem o atual)
  currentPaymentAmount: number;
  currentPaymentCurrency: string;
  onClose: () => void;
  // currentPaymentId foi removido das props pois historyData já deve vir filtrado
}

const MAX_ITEMS_FOR_DISPLAY_AND_AVERAGE = 6; // Máximo de itens para gráfico, lista e média

export default function HistoryModal({
  isVisible,
  payeeName,
  historyData, // Este é o histórico COMPLETO (já ordenado mais recente primeiro)
  currentPaymentAmount,
  currentPaymentCurrency,
  onClose,
}: HistoryModalProps) {
  // 1. Prepara os dados a serem exibidos (limitado a MAX_ITEMS_FOR_DISPLAY_AND_AVERAGE)
  //    Estes dados serão usados para a lista, média e destaques min/max.
  const displayedHistory = useMemo(() => {
    return historyData.slice(0, MAX_ITEMS_FOR_DISPLAY_AND_AVERAGE);
  }, [historyData]);

  // 2. Calcula o sumário (média, etc.) baseado em displayedHistory
  const summaryStats = useMemo(() => {
    if (!displayedHistory || displayedHistory.length === 0) {
      return {
        averageAmount: null,
        comparisonText: 'Sem histórico suficiente para comparação.',
        comparisonColor: Colors.textMuted,
        comparisonIconName: null,
      };
    }
    const sum = displayedHistory.reduce((acc, item) => acc + item.rawAmount, 0);
    const avg = sum / displayedHistory.length;
    const diff = ((currentPaymentAmount - avg) / avg) * 100;

    let text = '';
    let color = Colors.text;
    let iconName: keyof typeof Ionicons.glyphMap | null = null;

    if (isNaN(diff)) {
      text = 'Não foi possível comparar.';
      color = Colors.textMuted;
    } else if (Math.abs(diff) < 5) {
      text = `~ ${diff.toFixed(0)}% (Estável)`;
      color = Colors.textMuted;
      iconName = 'remove-outline';
    } else if (diff > 0) {
      text = `${diff.toFixed(0)}% mais caro`;
      color = Colors.error;
      iconName = 'arrow-up-circle-outline';
    } else {
      text = `${Math.abs(diff).toFixed(0)}% mais barato`;
      color = Colors.success;
      iconName = 'arrow-down-circle-outline';
    }
    return {
      averageAmount: avg,
      comparisonText: text,
      comparisonColor: color,
      comparisonIconName: iconName,
    };
  }, [displayedHistory, currentPaymentAmount]);

  // 3. Prepara dados da LISTA com DESTAQUES MIN/MAX (baseado em displayedHistory)
  const listDataWithHighlights = useMemo((): DisplayHistoryItemInternal[] => {
    if (!displayedHistory || displayedHistory.length === 0) return [];
    let minAmount = Infinity;
    let maxAmount = -Infinity;
    let minId: string | null = null;
    let maxId: string | null = null;

    displayedHistory.forEach((item) => {
      if (item.rawAmount < minAmount) {
        minAmount = item.rawAmount;
        minId = item.id;
      }
      if (item.rawAmount > maxAmount) {
        maxAmount = item.rawAmount;
        maxId = item.id;
      }
    });
    if (minAmount === maxAmount && displayedHistory.length > 1) {
      minId = null;
      maxId = null;
    }
    if (displayedHistory.length <= 1) {
      minId = null;
      maxId = null;
    }
    return displayedHistory.map((item) => ({
      ...item,
      isMin: item.id === minId,
      isMax: item.id === maxId,
    }));
  }, [displayedHistory]);

  // 4. Prepara dados para o GRÁFICO (baseado em displayedHistory)
  const chartData = useMemo(() => {
    // Precisa de pelo menos 1 ponto para o gráfico de barras (algumas libs podem precisar de 2)
    if (!displayedHistory || displayedHistory.length === 0) return null;
    // Inverte para mostrar do mais antigo para o mais novo no gráfico
    const dataForChart = [...displayedHistory].reverse();
    return {
      labels: dataForChart.map((item) => item.displayDate.substring(0, 5)), // "MM/AA"
      datasets: [{ data: dataForChart.map((item) => item.rawAmount) }],
    };
  }, [displayedHistory]);

  // Configuração do gráfico
  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(187, 134, 252, ${opacity})`, // Colors.primary
    labelColor: (opacity = 1) =>
      Colors.text
        ? Colors.text.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
        : `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 8 },
    propsForDots: { r: '3', strokeWidth: '1', stroke: Colors.primary },
    barPercentage: displayedHistory.length > 3 ? 0.5 : 0.7, // Barras mais largas se poucos dados
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.border,
      strokeWidth: 0.5,
    }, // Linhas de fundo mais suaves
  };
  const screenWidth = Dimensions.get('window').width;
  const horizontalModalContentPadding = styles.modalView.padding || 20;
  const modalPadding = horizontalModalContentPadding * 2; // Total de padding horizontal (esquerda + direita)
  const modalPaddingsTotal = horizontalModalContentPadding * 2;

  const chartWidth = screenWidth * 0.9 - modalPaddingsTotal; // Ajuste 0.90 se seu modalView.width for diferente

  const renderHistoryItem = ({
    item,
  }: ListRenderItemInfo<DisplayHistoryItemInternal>) => {
    let itemComparisonText = '';
    let itemComparisonColor = Colors.textMuted;
    let itemComparisonIcon: keyof typeof Ionicons.glyphMap | null = null;
    if (currentPaymentAmount && typeof item.rawAmount === 'number') {
      const diff =
        ((item.rawAmount - currentPaymentAmount) / currentPaymentAmount) * 100;
      if (isNaN(diff)) {
        itemComparisonText = '-';
      } else if (Math.abs(diff) < 5) {
        itemComparisonText = `~ ${diff.toFixed(0)}%`;
        itemComparisonIcon = 'remove-circle-outline';
        itemComparisonColor = Colors.textMuted;
      } else if (item.rawAmount > currentPaymentAmount) {
        itemComparisonText = `↑ ${diff.toFixed(0)}%`;
        itemComparisonIcon = 'arrow-up-circle-outline';
        itemComparisonColor = Colors.error;
      } else {
        itemComparisonText = `↓ ${Math.abs(diff).toFixed(0)}%`;
        itemComparisonIcon = 'arrow-down-circle-outline';
        itemComparisonColor = Colors.success;
      }
    }
    let amountSpecificStyle = {};
    if (item.isMin) amountSpecificStyle = styles.minAmountText;
    if (item.isMax) amountSpecificStyle = styles.maxAmountText;
    return (
      <View style={styles.historyListItem}>
        <View style={styles.historyItemMain}>
          <Text style={styles.historyDate}>{item.displayDate}</Text>
          <Text style={[styles.historyAmount, amountSpecificStyle]}>
            {item.formattedAmount}
          </Text>
        </View>
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
        {/* ScrollView para o conteúdo do modal se exceder a altura máxima */}
        <ScrollView contentContainerStyle={styles.modalScrollViewContent}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Histórico para: {payeeName}</Text>
            {/* Seção de Sumário */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Pagamento Atual:{' '}
                {formatCurrency(currentPaymentAmount, currentPaymentCurrency)}
              </Text>
              {summaryStats.averageAmount !== null && (
                <Text style={styles.summaryText}>
                  Média dos últimos {displayedHistory.length}:{' '}
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

            {/* GRÁFICO */}
            {chartData && chartData.labels.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>
                  Valores (Últimos {chartData.labels.length}{' '}
                  {chartData.labels.length === 1 ? 'Pag.' : 'Pag.'})
                </Text>
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={200}
                  yAxisLabel={currentPaymentCurrency === 'BRL' ? 'R$ ' : '$ '}
                  chartConfig={chartConfig}
                  verticalLabelRotation={displayedHistory.length > 4 ? 25 : 0}
                  fromZero={true}
                  style={styles.chartStyle}
                  showValuesOnTopOfBars={true}
                  // withHorizontalLabels={displayedHistory.length < 5} // Opcional
                />
              </View>
            )}

            {/* Lista de Histórico */}
            {listDataWithHighlights && listDataWithHighlights.length > 0 ? (
              <View style={styles.historyListContainer}>
                <Text style={styles.listTitle}>
                  Pagamentos Detalhados (Últimos {listDataWithHighlights.length}
                  )
                </Text>
                <FlatList<DisplayHistoryItemInternal>
                  data={listDataWithHighlights}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false} // Scroll já é tratado pelo ScrollView do Modal
                />
              </View>
            ) : (
              <Text style={styles.historyEmptyText}>
                Nenhum histórico de pagamento aprovado encontrado.
              </Text>
            )}

            {/* Botão Fechar */}
            <View style={styles.closeButtonContainer}>
              <AppButton title='Fechar' onPress={onClose} variant='primary' />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
