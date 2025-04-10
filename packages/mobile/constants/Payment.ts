export interface Payment {
  id: string;
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  payee: string;
  requester: string;
  requesterDepartment?: string;
  dueDate: string | null; // Permite null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Use seu Enum se definiu aqui
  description?: string | null; // Permite null

  // --- CAMPOS ADICIONADOS/ATUALIZADOS AQUI ---
  createdAt: Date; // Adicione este
  updatedAt: Date; // Adicione este
  approverId?: string | null; // Adicione este (opcional)
  approvedAt?: Date | null; // Adicione este (opcional)
  cancellerId?: string | null; // Adicione este (opcional)
  cancelledAt?: Date | null; // Adicione este (opcional)
  requesterId: string; // Adicione se não estava (vem do Prisma)
  // -----------------------------------------
}
