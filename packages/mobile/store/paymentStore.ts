import { createSelector } from 'reselect';
import { create } from 'zustand';
import { Payment } from '../constants/Payment';
import { MOCK_PAYMENTS } from '../data/mockPayments';

export interface PaymentSection {
  requesterName: string;
  requesterPhotoUrl?: string;
  data: Payment[];
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
  console.log(
    '>>> RESELECT: Recalculando agrupamento de pagamentos pendentes...'
  );

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const grouped = pendingPayments.reduce<Record<string, Payment[]>>(
    (acc, payment) => {
      const requester = payment.requester;
      if (!acc[requester]) {
        acc[requester] = [];
      }
      acc[requester].push(payment);
      return acc;
    },
    {}
  );

  const formattedSections: PaymentSection[] = Object.entries(grouped)
    .map(([requesterName, paymentData]) => ({
      requesterName: requesterName,
      requesterPhotoUrl: undefined,
      data: paymentData,
    }))
    .sort((a, b) => a.requesterName.localeCompare(b.requesterName));

  return formattedSections;
};

export const selectMemoizedGroupedPendingPayments = createSelector(
  [selectPayments],
  calculateGroupedPendingPayments
);
