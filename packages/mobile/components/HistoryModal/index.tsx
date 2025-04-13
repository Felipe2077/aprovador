// packages/mobile/components/HistoryModal/index.tsx
import React from 'react';
import { FlatList, Modal, Text, View } from 'react-native';
import { HistoryItem } from 'shared-types';
import AppButton from '../AppButton';
import styles from './HistoryModal.styles'; // Estilos locais

// Props que o Modal de Histórico receberá
interface HistoryModalProps {
  isVisible: boolean;
  payeeName: string; // Para o título
  historyData: HistoryItem[]; // Os dados já processados
  onClose: () => void; // Função para fechar o modal
  // isLoadingHistory?: boolean; // Poderia receber um estado de loading
}

export default function HistoryModal({
  isVisible,
  payeeName,
  historyData,
  onClose,
}: // isLoadingHistory = false, // Descomente se usar loading
HistoryModalProps) {
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
      onRequestClose={onClose} // Botão voltar Android
    >
      <View style={styles.modalCenteredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Histórico para: {payeeName}</Text>

          {/* TODO: Adicionar ActivityIndicator se isLoadingHistory for true */}

          {/* Lista de Histórico ou Mensagem de Vazio */}
          {historyData.length > 0 ? (
            <View style={styles.historyListContainer}>
              <FlatList
                data={historyData}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          ) : (
            // Poderia mostrar um ActivityIndicator aqui se isLoadingHistory for true
            // e historyData estiver vazio
            <Text style={styles.historyEmptyText}>
              Nenhum histórico de pagamento aprovado encontrado.
            </Text>
          )}

          {/* Botão Fechar */}
          <View style={styles.closeButtonContainer}>
            <AppButton
              title='Fechar'
              onPress={onClose}
              variant='neutral' // Ou 'muted', 'default'
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
