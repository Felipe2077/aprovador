import AppButton from '@/components/AppButton';
import RejectionModal from '@/components/RejectionModal';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HistoryItem, Payment, PaymentStatus } from 'shared-types';
import { getTextColorForVariant } from '../../components/AppButton/AppButton.styles'; //
import HistoryModal from '../../components/HistoryModal';
import Colors from '../../constants/Colors';
import { formatCurrency } from '../../constants/formatCurrency';
import { usePaymentStore } from '../../store/paymentStore';
import styles from '../../styles/screens/[id].styles';

/**
 * Tela de detalhes do pagamento.
 * Exibe informações detalhadas sobre um pagamento específico.
 * Permite aprovar, rejeitar ou cancelar o pagamento.
 */

export default function PaymentDetailScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<
    Payment | null | undefined
  >(undefined);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const approvePayment = usePaymentStore((state) => state.approvePayment);
  const rejectPayment = usePaymentStore((state) => state.rejectPayment);
  const cancelPayment = usePaymentStore((state) => state.cancelPayment);

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);

  // --- ESTADOS PARA MODAL DE HISTÓRICO ---
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [paymentHistoryData, setPaymentHistoryData] = useState<HistoryItem[]>(
    []
  );
  const mockApprovalSequence = [
    { id: 'user_john_123', name: 'João Silva', status: 'Aprovado' },
    { id: 'user_mary_456', name: 'Maria Souza', status: 'Pendente' },
    { id: 'user_director_999', name: 'Diretor X', status: 'Não Iniciado' },
    { id: 'user_finance_000', name: 'Financeiro Dept', status: 'Não Iniciado' },
  ];

  const mockComments = [
    {
      id: 'c1',
      author: 'Diretor X',
      date: '12/04/2025 15:30',
      text: 'Rejeitado. Favor detalhar o item XYZ na descrição.',
    },
    {
      id: 'c2',
      author: paymentDetails?.requesterName || 'Solicitante',
      date: '13/04/2025 09:15',
      text: 'Ajuste feito conforme solicitado.',
    },
  ];

  const mockAttachments = [
    { id: 'a1', name: 'nota_fiscal_12345.pdf', type: 'pdf' },
    { id: 'a2', name: 'comprovante_adiantamento.jpg', type: 'image' },
    { id: 'a3', name: 'contrato_servico_assinado.pdf', type: 'pdf' },
  ];

  const handleOpenHistoryModal = () => {
    if (!paymentDetails) return;
    console.log(`Abrindo histórico para payee: ${paymentDetails.payee}`);
    const allPayments = usePaymentStore.getState().payments;
    const history = allPayments
      .filter(
        (p) =>
          p.payee === paymentDetails.payee &&
          p.status === PaymentStatus.APPROVED &&
          p.id !== paymentDetails.id
      )
      .sort(
        (a, b) =>
          new Date(b.dueDate || b.createdAt).getTime() -
          new Date(a.dueDate || a.createdAt).getTime()
      )
      .map((p) => ({
        id: p.id,
        displayDate: new Intl.DateTimeFormat('pt-BR', {
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(p.dueDate || p.createdAt)),
        formattedAmount: formatCurrency(p.amount, p.currency),
      }));
    console.log('Histórico encontrado:', history);
    setPaymentHistoryData(history);
    setIsHistoryModalVisible(true);
  };

  useEffect(() => {
    setLoading(true);
    setPaymentDetails(undefined);
    console.log(`Buscando detalhes para ID: ${id}`);
    const timer = setTimeout(() => {
      const foundPayment = usePaymentStore
        .getState()
        .payments.find((p) => p.id === id);
      console.log(
        'Busca concluída, pagamento encontrado:',
        foundPayment ? foundPayment.id : 'Nenhum'
      );
      setPaymentDetails(foundPayment || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleApprove = () => {
    if (!paymentDetails) return;
    approvePayment(paymentDetails.id);
    Alert.alert('Sucesso', `Pagamento para ${paymentDetails.payee} aprovado!`);
    router.back();
  };

  const handleReject = () => {
    if (!paymentDetails) return;
    console.log('Reject button pressed, opening modal...');
    // Não precisa mais limpar rejectionReason aqui
    setIsRejectModalVisible(true);
  };

  const handleConfirmRejection = (reasonFromModal: string) => {
    if (!paymentDetails) return;
    console.log(
      `CONFIRMANDO Rejeição para ${paymentDetails.id}. Motivo: ${reasonFromModal}`
    );
    // TODO - Fase 3: Chamar rejectPayment(paymentDetails.id, reasonFromModal);
    setIsRejectModalVisible(false); // Fecha o modal (ainda é responsabilidade do pai)
    Alert.alert(
      'Rejeitado',
      `Pagamento para ${paymentDetails.payee} rejeitado (motivo simulado).`
    );
    router.back();
  };

  const handleCancel = () => {
    if (!paymentDetails) return;
    // Futuramente: pedir motivo do cancelamento aqui
    cancelPayment(paymentDetails.id); // Chama a ação da store
    Alert.alert(
      'Cancelado',
      `Pagamento para ${paymentDetails.payee} cancelado com sucesso.`
    );
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Carregando...' }} />
        <ActivityIndicator size='large' />
        <Text style={styles.loadingText}>Buscando detalhes...</Text>
      </View>
    );
  }

  if (!paymentDetails) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Erro' }} />
        <Text style={styles.errorText}>Pagamento não encontrado.</Text>
        <Button title='Voltar para Lista' onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      {/* ScrollView para o conteúdo principal */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps='handled' // Ajuda a fechar teclado ao tocar fora no Android
      >
        {/* Configura título dinâmico do header */}
        <Stack.Screen
          options={{
            title: `Pagamento ${paymentDetails.id}`,
            headerTintColor: Colors.text,
            headerBackTitle: '',
          }}
        />

        {/* Título da Página */}
        <Text style={styles.title}>Detalhes do Pagamento</Text>
        {/* Botão de Histórico (ex: perto do título ou dos botões de ação) */}
        <TouchableOpacity
          onPress={handleOpenHistoryModal}
          style={styles.historyButton}
        >
          <FontAwesome name='history' size={18} color={Colors.primary} />
          <Text style={styles.historyButtonText}>Ver Histórico</Text>
        </TouchableOpacity>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='person-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Recebedor:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.payee}</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='cash-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Valor:</Text>
          </View>
          <Text style={[styles.value, styles.amountValue]}>
            {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='person-circle-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Solicitante:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.requesterId}</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='calendar-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Vencimento:</Text>
          </View>
          <Text style={styles.value}>
            {
              paymentDetails.dueDate
                ? // Se dueDate existe...
                  // Tenta criar um objeto Date (funciona com Date ou string ISO)
                  // e formata para o padrão brasileiro (ou outro de sua preferência)
                  new Date(paymentDetails.dueDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'N/A' // Se dueDate for null ou undefined, mostra N/A
            }
          </Text>
        </View>
        {paymentDetails.description && (
          <View style={styles.detailItem}>
            <View style={styles.labelContainer}>
              <Ionicons
                name='document-text-outline'
                size={18}
                color={Colors.textSecondary}
                style={styles.labelIcon}
              />
              <Text style={styles.label}>Descrição:</Text>
            </View>
            <Text style={styles.value}>{paymentDetails.description}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <Ionicons
              name='information-circle-outline'
              size={18}
              color={Colors.textSecondary}
              style={styles.labelIcon}
            />
            <Text style={styles.label}>Status Atual:</Text>
          </View>
          <Text style={styles.value}>{paymentDetails.status}</Text>
        </View>

        {/* --- SEÇÃO PLACEHOLDER: FLUXO DE APROVAÇÃO --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Fluxo de Aprovação</Text>
          {mockApprovalSequence.map((approver, index) => (
            <View key={approver.id} style={styles.sequenceItem}>
              <Ionicons
                name={
                  approver.status === 'Aprovado'
                    ? 'checkmark-circle'
                    : approver.status === 'Pendente'
                    ? 'time-outline'
                    : 'ellipse-outline'
                }
                size={20}
                color={
                  approver.status === 'Aprovado'
                    ? Colors.success
                    : approver.status === 'Pendente'
                    ? Colors.warning
                    : Colors.textMuted
                }
                style={styles.sequenceIcon}
              />
              <Text
                style={[
                  styles.sequenceText,
                  {
                    color:
                      approver.status === 'Pendente'
                        ? Colors.warning
                        : Colors.textSecondary,
                  },
                ]}
              >
                {index + 1}. {approver.name} ({approver.status})
              </Text>
            </View>
          ))}
        </View>
        {/* ------------------------------------------- */}

        {/* --- SEÇÃO PLACEHOLDER: HISTÓRICO DE CONVERSA --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Histórico de Conversa</Text>
          {mockComments.length > 0 ? (
            mockComments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>
                  {comment.author} ({comment.date}):
                </Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholderText}>
              Nenhum comentário nesta solicitação.
            </Text>
          )}
        </View>
        {/* ------------------------------------------- */}

        {/* --- SEÇÃO PLACEHOLDER: ANEXOS --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Anexos</Text>
          {mockAttachments.length > 0 ? (
            mockAttachments.map((attachment) => (
              // Tornar clicável depois para abrir o anexo
              <TouchableOpacity
                key={attachment.id}
                style={styles.attachmentItem}
              >
                <Ionicons
                  name={
                    attachment.type === 'pdf'
                      ? 'document-text-outline'
                      : 'image-outline'
                  }
                  size={20}
                  color={Colors.primary}
                  style={styles.attachmentIcon}
                />
                <Text style={styles.attachmentText}>{attachment.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholderText}>
              Nenhum anexo nesta solicitação.
            </Text>
          )}
        </View>
        {/* ------------------------------------------- */}

        {/* Botões de Ação (Apenas se pendente) */}
        {paymentDetails.status === PaymentStatus.PENDING && (
          <View style={styles.buttonContainer}>
            <AppButton
              title='Cancelar'
              onPress={handleCancel}
              variant='danger'
              iconLeft={
                <Ionicons
                  name='close-circle-outline'
                  size={20}
                  color={getTextColorForVariant('danger')}
                />
              }
              disabled={loading}
            />
            <AppButton
              title='Rejeitar'
              onPress={handleReject}
              variant='warning'
              iconLeft={
                <Ionicons
                  name='arrow-undo-outline'
                  size={20}
                  color={getTextColorForVariant('warning')}
                />
              }
              disabled={loading}
            />
            <AppButton
              title='Aprovar'
              onPress={handleApprove}
              variant='success'
              iconLeft={
                <Ionicons
                  name='thumbs-up-outline'
                  size={20}
                  color={getTextColorForVariant('success')}
                />
              }
              disabled={loading}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Rejeição */}
      <RejectionModal
        isVisible={isRejectModalVisible}
        payeeName={paymentDetails?.payee || ''} // Passa o nome para o título do modal
        onClose={() => setIsRejectModalVisible(false)} // Função para fechar
        onSubmit={handleConfirmRejection} // Função a ser chamada ao confirmar
      />

      {/* --- Modal de Histórico --- */}
      <HistoryModal
        isVisible={isHistoryModalVisible}
        payeeName={paymentDetails?.payee || ''} // Passa o nome
        historyData={paymentHistoryData} // Passa os dados do histórico
        onClose={() => setIsHistoryModalVisible(false)} // Passa a função para fechar
      />
    </KeyboardAvoidingView>
  );
}
