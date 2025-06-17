// packages/api/src/routes/oracle-test.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { oracleDataSource } from '../lib/typeorm';

export default async function oracleTestRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Rota para testar Oracle (sem auth)
  server.get('/oracle/test', async (_request, reply) => {
    try {
      const result = await oracleDataSource.query(
        'SELECT COUNT(*) as total FROM GLOBUS.CPGDOCTO WHERE ROWNUM <= 100'
      );

      return {
        status: 'success',
        message: 'Oracle ERP conectado!',
        data: result[0],
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
  });

  // Consulta de APs recentes (com auth)
  server.get(
    '/oracle/recent-payments',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const payments = await oracleDataSource.query(`
        SELECT 
          CODDOCTOCPG,
          USUARIO,
          DATA_INCLUSAO,
          FAVORECIDODOCTOCPG,
          STATUSDOCTOCPG,
          VENCIMENTOCPG
        FROM GLOBUS.CPGDOCTO 
        WHERE DATA_INCLUSAO >= SYSDATE - 7
        ORDER BY DATA_INCLUSAO DESC
        FETCH FIRST 10 ROWS ONLY
      `);

        return {
          status: 'success',
          data: payments,
          count: payments.length,
          period: 'Últimos 7 dias',
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

  // Status dos documentos (com auth)
  server.get(
    '/oracle/status-stats',
    {
      preHandler: [server.authenticate],
    },
    async (_request, reply) => {
      try {
        const stats = await oracleDataSource.query(`
        SELECT 
          STATUSDOCTOCPG,
          COUNT(*) as quantidade,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM GLOBUS.CPGDOCTO 
            WHERE DATA_INCLUSAO >= SYSDATE - 30
          ), 2) as percentual
        FROM GLOBUS.CPGDOCTO 
        WHERE DATA_INCLUSAO >= SYSDATE - 30
        GROUP BY STATUSDOCTOCPG
        ORDER BY COUNT(*) DESC
      `);

        return {
          status: 'success',
          data: stats,
          period: 'Últimos 30 dias',
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

  // Buscar por usuário específico (com auth)
  server.get(
    '/oracle/user-payments/:username',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const { username } = request.params as { username: string };

        const payments = await oracleDataSource.query(
          `
        SELECT 
          CODDOCTOCPG,
          DATA_INCLUSAO,
          FAVORECIDODOCTOCPG,
          STATUSDOCTOCPG,
          VENCIMENTOCPG
        FROM GLOBUS.CPGDOCTO 
        WHERE USUARIO = :username
        AND DATA_INCLUSAO >= SYSDATE - 90
        ORDER BY DATA_INCLUSAO DESC
        FETCH FIRST 20 ROWS ONLY
      `,
          [username]
        );

        return {
          status: 'success',
          data: payments,
          count: payments.length,
          user: username,
          period: 'Últimos 90 dias',
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
