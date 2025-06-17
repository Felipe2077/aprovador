// packages/api/src/routes/jobs.ts
import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { JobType } from '../config/jobs.config';
import { JobService } from '../services/job.service';

/**
 * Rotas da API para Jobs
 *
 * Endpoints para controle e monitoramento dos jobs automatizados:
 * - Execução manual de jobs
 * - Monitoramento de status
 * - Métricas de performance
 * - Controle do scheduler
 *
 * Seguindo padrões REST e boas práticas de APIs.
 */

const TriggerJobSchema = Type.Object({
  jobType: Type.Enum(JobType),
});

const SchedulerControlSchema = Type.Object({
  action: Type.Union([Type.Literal('start'), Type.Literal('stop')]),
});

export default async function jobsRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const jobService = new JobService();

  // ✅ GET /jobs/status - Status geral dos jobs
  server.get(
    '/status',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Obtém status geral de todos os jobs',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Literal('success'),
            data: Type.Object({
              scheduler: Type.Any(),
              jobManager: Type.Any(),
              configuration: Type.Any(),
            }),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const status = jobService.getJobsStatus();

        return {
          status: 'success',
          data: status,
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

  // ✅ GET /jobs/health - Health check rápido
  server.get(
    '/health',
    {
      // Endpoint público para health checks externos
      schema: {
        description: 'Health check rápido do sistema',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('ok'),
              Type.Literal('degraded'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const health = await jobService.getQuickHealth();

      const httpStatus =
        health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;

      return reply.code(httpStatus).send(health);
    }
  );

  // ✅ GET /jobs/metrics - Métricas de performance
  server.get(
    '/metrics',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Obtém métricas de performance dos jobs',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Literal('success'),
            data: Type.Any(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const metrics = jobService.getJobMetrics();

        return {
          status: 'success',
          data: metrics,
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

  // ✅ POST /jobs/sync/manual - Execução manual de sincronização
  server.post(
    '/sync/manual',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Executa sincronização Oracle → PostgreSQL manualmente',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('success'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            data: Type.Optional(Type.Any()),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const result = await jobService.executeSyncManual();

        const httpStatus = result.status === 'success' ? 200 : 500;
        return reply.code(httpStatus).send(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // ✅ POST /jobs/sync/emergency - Sincronização de emergência
  server.post(
    '/sync/emergency',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Executa sincronização de emergência (bypass JobManager)',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('success'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            data: Type.Optional(Type.Any()),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const result = await jobService.executeEmergencySync();

        const httpStatus = result.status === 'success' ? 200 : 500;
        return reply.code(httpStatus).send(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // ✅ POST /jobs/health-check - Health check manual
  server.post(
    '/health-check',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Executa health check completo manualmente',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('success'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            data: Type.Optional(Type.Any()),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const result = await jobService.executeHealthCheckManual();

        const httpStatus = result.status === 'success' ? 200 : 500;
        return reply.code(httpStatus).send(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // ✅ POST /jobs/trigger - Força execução de job específico
  server.post<{ Body: { jobType: JobType } }>(
    '/trigger',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Força execução imediata de job específico',
        tags: ['Jobs'],
        body: TriggerJobSchema,
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('success'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            jobId: Type.Optional(Type.String()),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { jobType } = request.body;
        const result = await jobService.triggerJob(jobType);

        const httpStatus = result.status === 'success' ? 200 : 500;
        return reply.code(httpStatus).send(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // ✅ POST /jobs/scheduler/control - Controla o scheduler (start/stop)
  server.post<{ Body: { action: 'start' | 'stop' } }>(
    '/scheduler/control',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Controla o scheduler (iniciar/parar)',
        tags: ['Jobs'],
        body: SchedulerControlSchema,
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('success'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            schedulerStatus: Type.Any(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { action } = request.body;
        const result = jobService.controlScheduler(action);

        const httpStatus = result.status === 'success' ? 200 : 500;
        return reply.code(httpStatus).send(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // ✅ POST /jobs/cleanup - Limpeza manual de jobs antigos
  server.post(
    '/cleanup',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Executa limpeza manual de jobs antigos',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Union([
              Type.Literal('success'),
              Type.Literal('error'),
            ]),
            message: Type.String(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const result = jobService.cleanupJobs();

        const httpStatus = result.status === 'success' ? 200 : 500;
        return reply.code(httpStatus).send(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // ✅ GET /jobs/logs - Logs recentes de jobs
  server.get<{ Querystring: { limit?: number } }>(
    '/logs',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Obtém logs recentes de execução de jobs',
        tags: ['Jobs'],
        querystring: Type.Object({
          limit: Type.Optional(
            Type.Number({ minimum: 1, maximum: 200, default: 50 })
          ),
        }),
        response: {
          200: Type.Object({
            status: Type.Literal('success'),
            data: Type.Object({
              jobs: Type.Array(Type.Any()),
              summary: Type.Object({
                total: Type.Number(),
                running: Type.Number(),
                completed: Type.Number(),
                failed: Type.Number(),
              }),
            }),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit = 50 } = request.query;
        const logs = jobService.getJobLogs(limit);

        return {
          status: 'success',
          data: logs,
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

  // ✅ GET /jobs/scheduler/status - Status específico do scheduler
  server.get(
    '/scheduler/status',
    {
      preHandler: [server.authenticate],
      schema: {
        description: 'Obtém status detalhado do scheduler',
        tags: ['Jobs'],
        response: {
          200: Type.Object({
            status: Type.Literal('success'),
            data: Type.Any(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        const status = jobService.getJobsStatus();

        return {
          status: 'success',
          data: status.scheduler,
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
}
