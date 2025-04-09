// app/(tabs)/index.tsx
import { Payment } from '@/constants/Payment';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PaymentListItem from '../../components/PaymentListItem';
import Colors from '../../constants/Colors';
import {
  PaymentSection,
  selectMemoizedGroupedPendingPayments,
  usePaymentStore,
} from '../../store/paymentStore';
import styles from '../../styles/screens/TabsIndex.styles';

export default function PendingPaymentsScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const sectionsData = usePaymentStore(selectMemoizedGroupedPendingPayments);
  const resetPayments = usePaymentStore((state) => state.resetPayments);

  const toggleSection = useCallback((requesterName: string) => {
    setExpandedSections((currentExpanded) => ({
      ...currentExpanded,
      [requesterName]: !currentExpanded[requesterName],
    }));
  }, []);

  const sectionsToRender = useMemo(() => {
    return sectionsData.map((section) => ({
      ...section,
      data: expandedSections[section.requesterName] ? section.data : [],
    }));
  }, [sectionsData, expandedSections]);

  const handleRefresh = useCallback(() => {
    console.log('Pull to refresh triggered!');
    setIsRefreshing(true);
    setTimeout(() => {
      resetPayments();
      console.log('Refresh finished! State reset.');
      setIsRefreshing(false);
    }, 1500);
  }, [resetPayments]);

  //TODO mover para um compenente separado
  const renderSectionHeader = ({ section }: { section: PaymentSection }) => {
    const isExpanded = !!expandedSections[section.requesterName]; // Garante que seja boolean
    return (
      <TouchableOpacity
        onPress={() => toggleSection(section.requesterName)}
        style={styles.sectionHeader}
      >
        {/* Ícone do Usuário */}
        <FontAwesome
          name='user-circle-o' // Ou "user-circle" para preenchido
          size={24} // Ajuste o tamanho conforme necessário
          color={Colors.textSecondary} // Use uma cor do tema
          style={styles.sectionHeaderIcon} // Estilo para margem, etc.
        />

        {/* Nome do Solicitante */}
        <Text style={styles.sectionHeaderText}>{section.requesterName}</Text>

        {/* Ícone Chevron para Expandir/Recolher */}
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'} // Muda a seta
          size={22} // Ajuste o tamanho
          color={Colors.textSecondary} // Use uma cor do tema
        />
      </TouchableOpacity>
    );
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <PaymentListItem payment={item} />
  );

  return (
    <View style={styles.container}>
      {sectionsData.length === 0 && !isRefreshing ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          <Text style={styles.emptyText}>Nenhum pagamento pendente!</Text>
          <Text style={styles.pullDownText}>
            (Puxe para baixo para atualizar)
          </Text>
        </ScrollView>
      ) : (
        <SectionList
          sections={sectionsToRender}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderPaymentItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          SectionSeparatorComponent={() => (
            <View style={styles.sectionSeparator} />
          )}
        />
      )}
    </View>
  );
}
