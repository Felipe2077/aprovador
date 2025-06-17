import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SyncService } from '../services/etl/sync.service';

export default async function syncRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // ✅ Rota para executar sincronização manual
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
          message: 'Sincronização executada com sucesso',
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

  // ✅ Rota para testar consulta Oracle
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
}
