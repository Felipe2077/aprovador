// app/(tabs)/index.tsx
import { Payment } from '@/constants/Payment';
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
  const renderSectionHeader = ({ section }: { section: PaymentSection }) => (
    <TouchableOpacity
      onPress={() => toggleSection(section.requesterName)}
      style={styles.sectionHeader}
    >
      <View style={styles.requesterPhotoPlaceholder}>
        <Text style={styles.requesterInitial}>
          {section.requesterName.charAt(0)}
        </Text>
      </View>
      <Text style={styles.sectionHeaderText}>{section.requesterName}</Text>
      <Text style={styles.sectionToggleIndicator}>
        {expandedSections[section.requesterName] ? '➖' : '➕'}
      </Text>
    </TouchableOpacity>
  );

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
