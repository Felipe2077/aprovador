// packages/api/data/mockPayments.ts
// ... (interface Payment, formatCurrency) ...

import { Payment } from '@/constants/Payment';

export const MOCK_PAYMENTS: Payment[] = [
  // Pagamentos pendentes existentes
  {
    id: '101',
    amount: 150.75,
    currency: 'BRL',
    payee: 'Fornecedor Alpha',
    requester: 'Alice',
    dueDate: '2025-04-10',
    status: 'pending',
    description: 'Material de escritório',
  },
  {
    id: '102',
    amount: 999.0,
    currency: 'BRL',
    payee: 'Consultoria Beta',
    requester: 'Bob',
    dueDate: '2025-04-15',
    status: 'pending',
  },
  {
    id: '103',
    amount: 50.0,
    currency: 'USD',
    payee: 'Serviço Online Gamma',
    requester: 'Alice',
    dueDate: '2025-04-08',
    status: 'pending',
    description: 'Assinatura mensal',
  },
  {
    id: '104',
    amount: 2500.5,
    currency: 'BRL',
    payee: 'Aluguel Escritório',
    requester: 'Carlos',
    dueDate: '2025-04-05',
    status: 'pending',
  },

  // --- ADICIONAR HISTÓRICO (Exemplo para Fornecedor Alpha) ---
  {
    id: '091',
    amount: 145.5,
    currency: 'BRL',
    payee: 'Fornecedor Alpha',
    requester: 'Alice',
    dueDate: '2025-03-10',
    status: 'approved',
    description: 'Material escritório Março',
  },
  {
    id: '081',
    amount: 160.0,
    currency: 'BRL',
    payee: 'Fornecedor Alpha',
    requester: 'Alice',
    dueDate: '2025-02-10',
    status: 'approved',
    description: 'Material escritório Fevereiro',
  },
  {
    id: '071',
    amount: 140.2,
    currency: 'BRL',
    payee: 'Fornecedor Alpha',
    requester: 'Alice',
    dueDate: '2025-01-10',
    status: 'approved',
    description: 'Material escritório Janeiro',
  },
  {
    id: '061',
    amount: 155.0,
    currency: 'BRL',
    payee: 'Fornecedor Alpha',
    requester: 'Alice',
    dueDate: '2024-12-10',
    status: 'approved',
    description: 'Material escritório Dezembro/24',
  },
  // Adicionar histórico para outros fornecedores também se quiser
  {
    id: '095',
    amount: 2500.5,
    currency: 'BRL',
    payee: 'Aluguel Escritório',
    requester: 'Carlos',
    dueDate: '2025-03-05',
    status: 'approved',
  },
  {
    id: '085',
    amount: 2500.5,
    currency: 'BRL',
    payee: 'Aluguel Escritório',
    requester: 'Carlos',
    dueDate: '2025-02-05',
    status: 'approved',
  },
];
