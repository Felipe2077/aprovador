// packages/api/src/routes/auth.ts - CORRIGIDO PARA SISTEMA HÍBRIDO
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserActivationStatus, UserRole } from 'shared-types';
import { User } from '../entities/postgresql/User.entity';
import { comparePassword } from '../lib/hash';
import { pgDataSource } from '../lib/typeorm';

const LoginBodySchema = Type.Object({
  username: Type.String(),
  password: Type.String(),
});
type LoginBody = Static<typeof LoginBodySchema>;

export default async function authRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  server.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        body: LoginBodySchema,
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const userRepo = pgDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { username: username.toUpperCase() }, // ✨ Normalizar para MAIÚSCULO
      });

      // ✨ NOVA LÓGICA: Verificar se usuário existe
      if (!user) {
        return reply.code(401).send({
          message: 'Invalid credentials',
          code: 'USER_NOT_FOUND',
        });
      }

      // ✨ NOVA LÓGICA: Verificar se usuário está dormante
      if (user.isDormant()) {
        return reply.code(403).send({
          message: 'Account needs activation',
          code: 'ACCOUNT_DORMANT',
          username: user.username,
          name: user.name,
        });
      }

      // ✨ NOVA LÓGICA: Verificar se usuário pode fazer login
      if (!user.canLogin()) {
        return reply.code(403).send({
          message: 'Account cannot login',
          code: 'ACCOUNT_INACTIVE',
        });
      }

      // ✨ NOVA LÓGICA: Verificar senha (só se passwordHash não for null)
      if (
        !user.passwordHash ||
        !(await comparePassword(password, user.passwordHash))
      ) {
        return reply.code(401).send({
          message: 'Invalid credentials',
          code: 'INVALID_PASSWORD',
        });
      }

      const accessToken = await reply.jwtSign(
        {
          sub: user.id,
          role: user.role as UserRole,
          name: user.name,
          // username removido - não está nos tipos do JWT
        },
        {
          expiresIn: server.config.JWT_EXPIRES_IN,
        }
      );

      return { accessToken };
    }
  );

  server.get(
    '/me',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      const userId = request.user.sub;

      const userRepo = pgDataSource.getRepository(User);
      const userProfile = await userRepo.findOne({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          activationStatus: true, // ✨ Incluir status de ativação
          erpEmail: true, // ✨ Incluir email do Oracle
          erpActive: true, // ✨ Incluir se está ativo no Oracle
          activatedAt: true, // ✨ Incluir quando ativou
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userProfile) {
        return reply.code(404).send({ message: 'User not found' });
      }

      // ✨ RETORNAR DADOS SEGUROS (sem senha)
      return userProfile.toSafeObject();
    }
  );

  // ✨ NOVA ROTA: Ativar conta dormante
  server.post<{
    Body: {
      username: string;
      password: string;
    };
  }>(
    '/activate',
    {
      schema: {
        body: Type.Object({
          username: Type.String(),
          password: Type.String({ minLength: 6 }),
        }),
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const userRepo = pgDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: {
          username: username.toUpperCase(),
          activationStatus: UserActivationStatus.DORMANT, // ✨ Usar enum correto
        },
      });

      if (!user) {
        return reply.code(404).send({
          message: 'Dormant user not found',
          code: 'USER_NOT_FOUND',
        });
      }

      if (!user.erpActive) {
        return reply.code(403).send({
          message: 'User is not active in Oracle system',
          code: 'ORACLE_USER_INACTIVE',
        });
      }

      try {
        // Importar função de hash
        const { hashPassword } = await import('../lib/hash');
        const passwordHash = await hashPassword(password);

        // Ativar conta
        user.activateAccount(passwordHash);
        await userRepo.save(user);

        // ✨ ADOTAR APs ÓRFÃS (via UserSyncService)
        const { UserSyncService } = await import(
          '../services/etl/user-sync.service'
        );
        const userSyncService = new UserSyncService();
        // Método já faz a adoção internamente no activateUser, mas vamos garantir
        await userSyncService['adoptOrphanPayments'](user);

        console.log(`✅ Usuário ${user.username} ativou conta com sucesso`);

        // Gerar token automaticamente
        const accessToken = await reply.jwtSign(
          {
            sub: user.id,
            role: user.role as UserRole,
            name: user.name,
            // username removido - não está nos tipos do JWT
          },
          {
            expiresIn: server.config.JWT_EXPIRES_IN,
          }
        );

        return {
          message: 'Account activated successfully',
          accessToken,
          user: user.toSafeObject(),
        };
      } catch (error) {
        console.error(`❌ Erro ao ativar usuário ${username}:`, error);
        return reply.code(500).send({
          message: 'Failed to activate account',
          code: 'ACTIVATION_FAILED',
        });
      }
    }
  );
}
