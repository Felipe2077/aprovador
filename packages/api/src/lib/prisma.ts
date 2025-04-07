// packages/api/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Cria uma única instância do PrismaClient
export const prisma = new PrismaClient({
  // Configurações opcionais de log do Prisma
  log: ['query', 'info', 'warn', 'error'],
});

// Você pode adicionar hooks de conexão/desconexão aqui se necessário
// prisma.$connect().catch(...)
// prisma.$on('beforeExit', async () => { await prisma.$disconnect(); })
