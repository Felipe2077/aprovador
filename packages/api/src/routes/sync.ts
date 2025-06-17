// packages/api/src/routes/sync.ts - VERSÃO HÍBRIDA COMPLETA
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SyncService } from '../services/etl/sync.service';
import { UserSyncService } from '../services/etl/user-sync.service';

export default async function syncRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // ✅ Rota para executar sincronização manual HÍBRIDA
  server.post(
    '/sync',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const syncService = new SyncService();
        const stats = await syncService.syncPayments(7); // Últimos 7 dias

        return {
          status: 'success',
          message: 'Sincronização HÍBRIDA executada com sucesso',
          data: stats,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // ✅ Rota para testar consulta Oracle (inalterada)
  server.get(
    '/test-oracle',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const syncService = new SyncService();
        const oracleData = await syncService.getOraclePayments(1); // Último dia

        return {
          status: 'success',
          data: oracleData.slice(0, 5), // Primeiros 5 para teste
          count: oracleData.length,
          message: 'Dados Oracle consultados com sucesso',
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // 🆕 NOVA ROTA: Estatísticas detalhadas do sistema híbrido
  server.get(
    '/stats',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const syncService = new SyncService();
        const userSyncService = new UserSyncService();

        const [syncStats, dormantUsers] = await Promise.all([
          syncService.getSyncStatistics(),
          userSyncService.getDormantUsers(),
        ]);

        return {
          status: 'success',
          data: {
            ...syncStats,
            dormantUsers: dormantUsers.slice(0, 10).map((user) => ({
              username: user.username,
              name: user.name,
              erpEmail: user.erpEmail,
              createdAt: user.createdAt,
              lastSyncAt: user.lastSyncAt,
            })),
            summary: {
              totalPayments: syncStats.payments.total,
              scheduledPayments: syncStats.payments.scheduled,
              orphanPayments: syncStats.payments.orphan,
              dormantUsers: syncStats.users.dormant,
              activeUsers: syncStats.users.active,
            },
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // 🆕 NOVA ROTA: Sincronização com estatísticas em tempo real
  server.post(
    '/sync-detailed',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const { days = 7 } = request.query as { days?: number };

        const syncService = new SyncService();

        // Estatísticas antes
        const statsBefore = await syncService.getSyncStatistics();

        // Executar sincronização
        const syncResult = await syncService.syncPayments(days);

        // Estatísticas depois
        const statsAfter = await syncService.getSyncStatistics();

        return {
          status: 'success',
          message: 'Sincronização detalhada executada com sucesso',
          data: {
            syncResult,
            before: statsBefore,
            after: statsAfter,
            changes: {
              paymentsAdded:
                statsAfter.payments.total - statsBefore.payments.total,
              usersAdded: statsAfter.users.total - statsBefore.users.total,
              dormantUsersAdded:
                statsAfter.users.dormant - statsBefore.users.dormant,
            },
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // 🆕 NOVA ROTA: Listar usuários dormentes para debug
  server.get(
    '/dormant-users',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const userSyncService = new UserSyncService();
        const dormantUsers = await userSyncService.getDormantUsers();

        return {
          status: 'success',
          data: dormantUsers.map((user) => ({
            id: user.id,
            username: user.username,
            name: user.name,
            erpEmail: user.erpEmail,
            erpActive: user.erpActive,
            createdAt: user.createdAt,
            lastSyncAt: user.lastSyncAt,
          })),
          count: dormantUsers.length,
          message: `${dormantUsers.length} usuários dormentes encontrados`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // 🆕 NOVA ROTA: Forçar criação de usuário específico (debug)
  server.post(
    '/create-user',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const { username } = request.body as { username: string };

        if (!username) {
          return reply.code(400).send({
            status: 'error',
            message: 'Username é obrigatório',
          });
        }

        const userSyncService = new UserSyncService();
        const user = await userSyncService.findOrCreateUserFromOracle(username);

        if (user) {
          return {
            status: 'success',
            data: {
              id: user.id,
              username: user.username,
              name: user.name,
              activationStatus: user.activationStatus,
              erpEmail: user.erpEmail,
              erpActive: user.erpActive,
              createdAt: user.createdAt,
            },
            message: `Usuário ${username} criado/encontrado com sucesso`,
          };
        } else {
          return reply.code(404).send({
            status: 'error',
            message: `Usuário ${username} não encontrado no Oracle ou está inativo`,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // 🆕 NOVA ROTA: Validar usuário Oracle específico (debug)
  server.get(
    '/validate-user/:username',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const { username } = request.params as { username: string };
        const { pgDataSource, oracleDataSource } = await import(
          '../lib/typeorm'
        );

        // Verificar se existe no PostgreSQL
        const userRepo = pgDataSource.getRepository('User');
        const pgUser = await userRepo.findOne({
          where: { username: username.toUpperCase() },
        });

        // Verificar no Oracle
        let oracleUser = null;
        try {
          const query = `
            SELECT USUARIO, NOMEUSUARIO, EMAIL, ATIVO
            FROM GLOBUS.CTR_CADASTRODEUSUARIOS
            WHERE USUARIO = :username
          `;
          const result = await oracleDataSource.query(query, [
            username.toUpperCase(),
          ]);
          oracleUser = result.length > 0 ? result[0] : null;
        } catch (error) {
          console.warn('Erro ao validar no Oracle:', error);
        }

        return {
          status: 'success',
          data: {
            username: username.toUpperCase(),
            existsInPostgreSQL: !!pgUser,
            existsInOracle: !!oracleUser,
            postgresqlUser: pgUser
              ? {
                  id: pgUser.id,
                  activationStatus: pgUser.activationStatus,
                  erpActive: pgUser.erpActive,
                  createdAt: pgUser.createdAt,
                }
              : null,
            oracleUser: oracleUser
              ? {
                  usuario: oracleUser.USUARIO,
                  nome: oracleUser.NOMEUSUARIO,
                  email: oracleUser.EMAIL,
                  ativo: oracleUser.ATIVO,
                }
              : null,
          },
          message: `Validação do usuário ${username} concluída`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // 🆕 NOVA ROTA: Limpar dados de teste (desenvolvimento)
  server.delete(
    '/clear-test-data',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const { pgDataSource } = await import('../lib/typeorm');
        const { Not, IsNull } = await import('typeorm');

        // CUIDADO: Apenas para desenvolvimento!
        if (process.env.NODE_ENV === 'production') {
          return reply.code(403).send({
            status: 'error',
            message: 'Operação não permitida em produção',
          });
        }

        // Deletar payments sincronizados
        const paymentRepo = pgDataSource.getRepository('Payment');
        const deletedPayments = await paymentRepo.delete({
          erpPaymentId: Not(IsNull()),
        });

        // Deletar usuários dormentes
        const userRepo = pgDataSource.getRepository('User');
        const deletedUsers = await userRepo.delete({
          activationStatus: 'dormant',
        });

        return {
          status: 'success',
          data: {
            deletedPayments: deletedPayments.affected || 0,
            deletedUsers: deletedUsers.affected || 0,
          },
          message: 'Dados de teste limpos com sucesso',
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );
}
