// packages/shared-types/src/enums/entities.enums.ts - VERSÃO ATUALIZADA
export enum UserRole {
  REQUESTER = 'requester',
  DIRECTOR = 'director',
  FINANCE = 'finance',
}

export enum PaymentStatus {
  SCHEDULED = 'scheduled', // 🆕 NOVO: AP sincronizada do Oracle, aguardando definição de fluxo
  PENDING = 'pending', // Aguardando aprovação
  APPROVED = 'approved', // Aprovado
  REJECTED = 'rejected', // Rejeitado
  CANCELLED = 'cancelled', // Cancelado
  PAID = 'paid', // Pago (usado pelo financeiro)
}

// 🆕 NOVO: Status de ativação de usuário
export enum UserActivationStatus {
  DORMANT = 'dormant', // Usuário criado automaticamente do Oracle, não ativado
  ACTIVE = 'active', // Usuário ativo, pode usar o sistema
  INACTIVE = 'inactive', // Usuário desativado
}
