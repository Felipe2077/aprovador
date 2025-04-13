// packages/shared-types/src/types/payment.types.ts
import { PaymentStatus } from '../enums/entities.enums';

export interface Payment {
  id: string;
  amount: number; // Prisma Float mapeia para number. Use Decimal do Prisma se precisar de alta precisão.
  currency: string;
  payee: string;
  description?: string | null; // Prisma String? -> string | null
  status: PaymentStatus; // Usa o enum atual
  dueDate?: Date | string | null; // Prisma DateTime? -> Date | null (string se mocks usam)

  // Campos de relacionamento e timestamps existentes no  schema
  requesterId: string;
  approverId?: string | null;
  approvedAt?: Date | string | null;
  cancellerId?: string | null;
  cancelledAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  requesterName?: string; // Útil ter aqui para UI
  requesterDepartment?: string | null; // Útil ter aqui para UI
}

// Tipos auxiliares para UI (dependem de Payment)
export interface PaymentSection {
  requesterName: string; // Vem do Payment.requesterName
  requesterPhotoUrl?: string; // Placeholder
  requesterDepartment?: string | null; // Vem do Payment.requesterDepartment
  count: number;
  data: Payment[]; // Usa a interface Payment acima
}

export interface HistoryItem {
  id: string;
  displayDate: string;
  formattedAmount: string;
}
