// packages/api/scripts/update-password.ts
import 'reflect-metadata';
import {
  initializeDataSources,
  PostgreSQLDataSource,
} from '../src/config/datasources';
import { User } from '../src/entities/postgresql/User.entity';
import { hashPassword } from '../src/lib/hash';

async function updatePassword() {
  try {
    await initializeDataSources();

    const userRepo = PostgreSQLDataSource.getRepository(User);

    // Buscar usuário admin
    const user = await userRepo.findOne({
      where: { username: 'admin' },
    });

    if (!user) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }

    // Gerar hash correto
    const newPasswordHash = await hashPassword('admin123');
    console.log('🔑 Hash gerado:', newPasswordHash);

    // Atualizar senha
    user.passwordHash = newPasswordHash;
    await userRepo.save(user);

    console.log('✅ Senha do usuário admin atualizada!');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
  } finally {
    process.exit(0);
  }
}

updatePassword();
