// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Payment, PaymentSection } from 'shared-types';
import PaymentListItem from '../../components/PaymentListItem';
import Colors from '../../constants/Colors';
import {
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
    const isExpanded = !!expandedSections[section.requesterName];
    // Define uma URL de fallback caso a da seção não exista
    const placeholderImage = require('../../assets/images/adaptive-icon.png'); // Use um asset local SEU!
    const imageUrl = section.requesterPhotoUrl; // Poderia usar o placeholder aqui se for undefined

    return (
      // O TouchableOpacity ainda envolve tudo para o clique
      <TouchableOpacity
        onPress={() => toggleSection(section.requesterName)}
        style={styles.sectionHeader}
      >
        {/* Foto (com fallback se necessário) */}
        <Image
          // source={imageUrl ? { uri: imageUrl } : placeholderImage} // Usa URL ou fallback local
          source={{ uri: imageUrl }} // Usando só a URL por enquanto
          style={styles.requesterPhoto}
          // Adicione um placeholder enquanto carrega (opcional)
          defaultSource={placeholderImage}
        />

        {/* Container para Nome e Departamento */}
        <View style={styles.requesterInfoContainer}>
          <Text style={styles.requesterNameText} numberOfLines={1}>
            {section.requesterName}
          </Text>
          {/* Mostra departamento se existir */}
          {section.requesterDepartment && (
            <Text style={styles.requesterDeptText} numberOfLines={1}>
              {section.requesterDepartment}
            </Text>
          )}
        </View>

        {/* Badge de Contagem */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{section.count}</Text>
        </View>

        {/* Ícone Chevron */}
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={22}
          color={Colors.textSecondary}
          style={styles.chevronIcon} // Adicionado estilo para possível margem
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
