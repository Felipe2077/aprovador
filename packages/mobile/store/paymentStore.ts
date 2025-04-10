import { createSelector } from 'reselect';
import { create } from 'zustand';
import { Payment } from '../constants/Payment';
import { MOCK_PAYMENTS } from '../data/mockPayments';

export interface PaymentSection {
  requesterName: string;
  requesterPhotoUrl?: string; // URL da foto (opcional por agora)
  requesterDepartment?: string; // Departamento (opcional)
  count: number; // Contagem de pagamentos na seção
  data: Payment[]; // Pagamentos da seção
}

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
        p.id === id ? { ...p, status: 'approved' } : p
      ),
    })),
  rejectPayment: (id) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: 'rejected' } : p
      ),
    })),
  cancelPayment: (id) => {
    console.log(`Payment ${id} cancelled in Zustand store.`);
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: 'cancelled' } : p
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
  console.log('>>> RESELECT: Recalculando agrupamento (com mais dados)...');
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  // Agrupa pegando o primeiro departamento encontrado para cada requester
  const grouped = pendingPayments.reduce<
    Record<string, { dept?: string; items: Payment[] }>
  >((acc, payment) => {
    const requester = payment.requester;
    if (!acc[requester]) {
      acc[requester] = { dept: payment.requesterDepartment, items: [] }; // Guarda o primeiro depto encontrado
    }
    acc[requester].items.push(payment);
    return acc;
  }, {});

  const formattedSections: PaymentSection[] = Object.entries(grouped)
    .map(([requesterName, groupData]) => ({
      requesterName: requesterName,
      // TODO: No futuro, buscar URL da foto real baseada no requesterName/ID
      requesterPhotoUrl: `https://i.pravatar.cc/150?u=${requesterName.replace(
        /\s+/g,
        ''
      )}`, // Placeholder divertido do pravatar
      requesterDepartment: groupData.dept, // Pega o departamento que guardamos
      count: groupData.items.length, // A contagem de itens
      data: groupData.items, // Os pagamentos
    }))
    .sort((a, b) => a.requesterName.localeCompare(b.requesterName));

  return formattedSections;
};

export const selectMemoizedGroupedPendingPayments = createSelector(
  [selectPayments],
  calculateGroupedPendingPayments
);
