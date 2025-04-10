// packages/api/data/mockPayments.ts
// (Mantenha a interface Payment e a função formatCurrency acima disto)

import { Payment } from '@/constants/Payment';

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: '101',
    amount: 150.75,
    currency: 'BRL',
    payee: 'Fornecedor Alpha',
    requester: 'Alice',
    requesterDepartment: 'Laboratório de Inovação', // Departamento OK
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
    requesterDepartment: 'Operações Estratégicas', // Departamento OK
    dueDate: '2025-04-15',
    status: 'pending',
  },
  {
    id: '103',
    amount: 50.0,
    currency: 'USD',
    payee: 'Serviço Online Gamma',
    requester: 'Alice',
    requesterDepartment: 'Laboratório de Inovação', // Departamento OK
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
    requesterDepartment: 'Infraestrutura & Facilities', // Departamento OK
    dueDate: '2025-04-05',
    status: 'pending',
  },
  {
    id: '106',
    amount: 450.0,
    currency: 'BRL',
    payee: 'Agência Criativa Delta',
    requester: 'Diana',
    requesterDepartment: 'Marketing Digital', // Departamento OK
    dueDate: '2025-04-12',
    status: 'pending',
    description: 'Campanha Redes Sociais',
  },
  {
    id: '107',
    amount: 1250.0,
    currency: 'BRL',
    payee: 'Software House Épsilon',
    requester: 'Bob',
    requesterDepartment: 'Operações Estratégicas', // Departamento OK
    dueDate: '2025-04-18',
    status: 'pending',
    description: 'Licença de Software X',
  },

  {
    id: '091',
    amount: 145.5,
    currency: 'BRL',
    payee: 'Fornecedor Alpha', // HISTÓRICO
    requester: 'Alice',
    requesterDepartment: 'Laboratório de Inovação', // Departamento OK
    dueDate: '2025-03-10',
    status: 'approved',
    description: 'Material escritório Março',
  },
  {
    id: '081',
    amount: 160.0,
    currency: 'BRL',
    payee: 'Fornecedor Alpha', // HISTÓRICO
    requester: 'Alice',
    requesterDepartment: 'Laboratório de Inovação', // Departamento OK
    dueDate: '2025-02-10',
    status: 'approved',
    description: 'Material escritório Fevereiro',
  },
  {
    id: '071',
    amount: 140.2,
    currency: 'BRL',
    payee: 'Fornecedor Alpha', // HISTÓRICO
    requester: 'Alice',
    requesterDepartment: 'Laboratório de Inovação', // Departamento OK
    dueDate: '2025-01-10',
    status: 'approved',
    description: 'Material escritório Janeiro',
  },
  {
    id: '061',
    amount: 155.0,
    currency: 'BRL',
    payee: 'Fornecedor Alpha', // HISTÓRICO
    requester: 'Alice',
    requesterDepartment: 'Laboratório de Inovação', // Departamento OK
    dueDate: '2024-12-10',
    status: 'approved',
    description: 'Material escritório Dezembro/24',
  },
  // Histórico para Aluguel Escritório (para teste do modal)
  {
    id: '095',
    amount: 2500.5,
    currency: 'BRL',
    payee: 'Aluguel Escritório', // HISTÓRICO
    requester: 'Carlos',
    requesterDepartment: 'Infraestrutura & Facilities', // Departamento OK
    dueDate: '2025-03-05',
    status: 'approved',
  },
  {
    id: '085',
    amount: 2500.5,
    currency: 'BRL',
    payee: 'Aluguel Escritório', // HISTÓRICO
    requester: 'Carlos',
    requesterDepartment: 'Infraestrutura & Facilities', // Departamento OK
    dueDate: '2025-02-05',
    status: 'approved',
  },
  // Histórico para Consultoria Beta (para teste do modal)
  {
    id: '098',
    amount: 950.0,
    currency: 'BRL',
    payee: 'Consultoria Beta', // HISTÓRICO
    requester: 'Bob',
    requesterDepartment: 'Operações Estratégicas', // Departamento OK
    dueDate: '2025-03-15',
    status: 'approved',
  },
];
