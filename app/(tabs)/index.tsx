import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import PaymentListItem from '../../components/PaymentListItem';
import { usePaymentStore } from '../../store/paymentStore';
import styles from '../../styles/screens/TabsIndex.styles';

export default function PendingPaymentsScreen() {
  const payments = usePaymentStore((state) => state.payments);
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    console.log('Pull to refresh triggered!');
    setIsRefreshing(true);
    //TODO No futuro, aqui você chamaria a função para buscar dados da API.
    setTimeout(() => {
      usePaymentStore.getState().resetPayments();
      console.log('Refresh finished!');
      setIsRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      {pendingPayments.length === 0 && !isRefreshing ? (
        <View style={styles.emptyContainer}>
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          <Text style={styles.emptyText}>Nenhum pagamento pendente!</Text>
          <Text style={styles.pullDownText}>
            (Puxe para baixo para atualizar)
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingPayments}
          renderItem={({ item }) => <PaymentListItem payment={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor='#fff'
              colors={['#fff']}
            />
          }
        />
      )}
    </View>
  );
}
