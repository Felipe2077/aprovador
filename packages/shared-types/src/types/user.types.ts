// packages/shared-types/src/types/user.types.ts
import { UserRole } from '../enums/entities.enums';

// Interface base refletindo o model User atual
export interface BaseUser {
  id: string;
  username: string;
  // passwordHash NUNCA deve ser exposto fora do backend estritamente necessário
  name: string;
  role: UserRole;
  // Adicione outros campos se existirem no seu model User atual (erpUserId?, email?, department?)
  requesterDepartment?: string;
}

// Interface mais completa para o perfil, por exemplo
export interface UserProfile extends BaseUser {
  createdAt: Date | string; // Date é ideal, string por flexibilidade com APIs/mocks
  updatedAt: Date | string;
}
