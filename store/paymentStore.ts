import { create } from 'zustand';
import { Payment } from '../constants/Payment';
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
