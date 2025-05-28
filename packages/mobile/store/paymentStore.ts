// packages/mobile/store/paymentStore.ts
import { createSelector } from 'reselect';
import { Payment, PaymentSection, PaymentStatus } from 'shared-types';
import { create } from 'zustand';
import { MOCK_PAYMENTS } from '../data/mockPayments';

interface PaymentState {
  payments: Payment[];
  approvePayment: (id: string) => void;
  rejectPayment: (id: string) => void;
  cancelPayment: (id: string) => void;
  resetPayments: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: MOCK_PAYMENTS,

  approvePayment: (id) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: PaymentStatus.APPROVED } : p
      ),
    })),
  rejectPayment: (id) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: PaymentStatus.REJECTED } : p
      ),
    })),
  cancelPayment: (id) => {
    console.log(`Payment ${id} cancelled in Zustand store.`);
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: PaymentStatus.CANCELLED } : p
      ),
    }));
  },
  resetPayments: () => {
    console.log('Resetting payments to original mocks in Zustand store.');
    set({ payments: MOCK_PAYMENTS });
  },
}));

const selectPayments = (state: PaymentState): Payment[] => state.payments;

const calculateGroupedPendingPayments = (
  payments: Payment[]
): PaymentSection[] => {
  console.log('>>> RESELECT: Recalculando agrupamento (Corrigido)...');
  const pendingPayments = payments.filter(
    (p) => p.status === PaymentStatus.PENDING
  ); // Use o Enum

  // 1. Define o tipo do acumulador CORRETAMENTE
  type GroupAccumulator = Record<
    string,
    {
      // A chave agora é o requesterId (string)
      requesterName: string; // Guarda o nome associado ao ID
      dept?: string | null; // Permite string OU null OU undefined
      items: Payment[]; // Lista de pagamentos
    }
  >;

  // 2. Agrupa pelo requesterId
  const groupedById = pendingPayments.reduce<GroupAccumulator>(
    (acc, payment) => {
      const id = payment.requesterId; // <-- USA O ID como chave

      // Se for a primeira vez vendo esse ID, inicializa o grupo
      if (!acc[id]) {
        acc[id] = {
          // Pega o nome e depto do primeiro pagamento encontrado para este ID
          // Fornece um fallback caso requesterName seja opcional e não exista
          requesterName: payment.requesterName || `Solicitante ${id}`,
          dept: payment.requesterDepartment, // Agora a atribuição é válida
          items: [],
        };
      }
      // Adiciona o pagamento atual à lista de itens desse grupo
      acc[id].items.push(payment);
      return acc;
    },
    {}
  ); // Começa com objeto vazio

  // 3. Mapeia o resultado agrupado para o formato final da SectionList
  const formattedSections: PaymentSection[] = Object.entries(groupedById)
    // O 'key' é o requesterId (não precisamos dele no objeto final)
    // 'groupData' é o objeto { requesterName, dept, items }
    .map(([, /* requesterId */ groupData]) => ({
      requesterName: groupData.requesterName, // Usa o nome guardado
      requesterPhotoUrl: `https://i.pravatar.cc/150?u=${groupData.requesterName.replace(
        /\s+/g,
        ''
      )}`, // Placeholder
      requesterDepartment: groupData.dept, // Usa o depto guardado
      count: groupData.items.length,
      data: groupData.items,
    }))
    .sort((a, b) => a.requesterName.localeCompare(b.requesterName)); // Ordena pelo nome

  return formattedSections;
};
export const selectMemoizedGroupedPendingPayments = createSelector(
  [selectPayments],
  calculateGroupedPendingPayments
);
