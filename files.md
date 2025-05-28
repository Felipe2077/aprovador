Modelos de dados e tipos compartilhados:

packages/shared-types/src/types/payment.types.ts [OK]
packages/shared-types/src/types/user.types.ts [OK]
packages/shared-types/src/enums/entities.enums.ts [OK]
packages/api/prisma/schema.prisma [OK]

Estrutura principal do backend:

packages/api/src/server.ts [OK]
packages/api/src/routes/auth.ts [OK]
packages/api/src/plugins/jwt.ts [OK]
packages/api/src/plugins/auth.ts [OK]

Gerenciamento de estado e serviços no frontend:
packages/mobile/store/authStore.ts [OK]
packages/mobile/store/paymentStore.ts [OK]
packages/mobile/services/authService.ts [OK]
Componentes principais do frontend:

packages/mobile/app/\_layout.tsx [OK]
packages/mobile/app/(auth)/login.tsx [OK]
packages/mobile/app/(tabs)/index.tsx [OK]
packages/mobile/app/payment/[id].tsx [OK]

Componentes reutilizáveis importantes:
packages/mobile/components/PaymentListItem/index.tsx [OK]
packages/mobile/components/PaymentDetailCard/index.tsx [OK]
packages/mobile/components/PaymentActionButtons/index.tsx [OK]
packages/mobile/components/RejectionModal/index.tsx [OK]
