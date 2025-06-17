// packages/api/scripts/create-user.ts
import 'reflect-metadata';
import { UserRole } from 'shared-types';
import {
  initializeDataSources,
  PostgreSQLDataSource,
} from '../src/config/datasources';
import { User } from '../src/entities/postgresql/User.entity';
import { hashPassword } from '../src/lib/hash';

async function createTestUser() {
  try {
    await initializeDataSources();

    const userRepo = PostgreSQLDataSource.getRepository(User);

    // Verificar se usuário já existe
    const existingUser = await userRepo.findOne({
      where: { username: 'admin' },
    });

    if (existingUser) {
      console.log('✅ Usuário admin já existe');
      return;
    }

    // Criar hash da senha
    const passwordHash = await hashPassword('admin123');

    // Criar usuário
    const user = userRepo.create({
      username: 'admin',
      passwordHash,
      name: 'Administrador Teste',
      role: UserRole.DIRECTOR,
    });

    await userRepo.save(user);
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
