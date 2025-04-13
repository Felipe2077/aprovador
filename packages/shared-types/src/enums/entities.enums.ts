// packages/shared-types/src/enums/entities.enums.ts

// DEFINIÇÃO MANUAL - Garanta que os VALORES string batem com o schema.prisma
export enum UserRole {
  REQUESTER = 'REQUESTER',
  DIRECTOR = 'DIRECTOR',
  // FINANCE = 'FINANCE', // Adicione se estiver no seu schema
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
