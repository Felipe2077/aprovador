// packages/api/src/services/job.service.ts
import {
  getJobsConfig,
  JobMetrics,
  JobStatus,
  JobType,
} from '../config/jobs.config';
import { executeHealthCheck, quickHealthCheck } from '../jobs/health-check.job';
import { jobManager } from '../jobs/job-manager';
import { scheduler } from '../jobs/scheduler';
import { executeEmergencySync, executeSyncJob } from '../jobs/sync.job';

/**
 * Serviço de Lógica de Negócio dos Jobs
 *
 * Camada de serviço que expõe funcionalidades dos jobs
 * para as rotas da API, seguindo padrões de clean architecture.
 *
 * Responsável por:
 * - Exposição controlada dos jobs via API
 * - Validações de negócio
 * - Formatação de dados para retorno
 * - Controle de acesso aos jobs
 */

export class JobService {
  private config = getJobsConfig();

  /**
   * Executa sincronização manual (via API)
   */
  async executeSyncManual(_days?: number): Promise<{
    status: 'success' | 'error';
    message: string;
    data?: any;
    timestamp: string;
  }> {
    try {
      console.log('🔄 Sincronização manual solicitada via API');

      const result = await executeSyncJob();

      return {
        status: 'success',
        message: 'Sincronização executada com sucesso',
        data: result.result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        message: `Erro na sincronização: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Executa sincronização de emergência
   */
  async executeEmergencySync(): Promise<{
    status: 'success' | 'error';
    message: string;
    data?: any;
    timestamp: string;
  }> {
    try {
      console.log('🚨 Sincronização de emergência solicitada via API');

      const result = await executeEmergencySync();

      return {
        status: 'success',
        message: 'Sincronização de emergência executada com sucesso',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        message: `Erro na sincronização de emergência: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Executa health check manual
   */
  async executeHealthCheckManual(): Promise<{
    status: 'success' | 'error';
    message: string;
    data?: any;
    timestamp: string;
  }> {
    try {
      const result = await executeHealthCheck();

      return {
        status: 'success',
        message: 'Health check executado com sucesso',
        data: result.result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        message: `Erro no health check: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtém health check rápido (para status da API)
   */
  async getQuickHealth(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    message: string;
    timestamp: string;
  }> {
    const result = await quickHealthCheck();

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtém status detalhado de todos os jobs
   */
  getJobsStatus(): {
    scheduler: any;
    jobManager: {
      runningJobs: JobStatus[];
      recentJobs: JobStatus[];
      health: any;
    };
    configuration: any;
  } {
    return {
      scheduler: scheduler.getStatus(),
      jobManager: {
        runningJobs: jobManager.getRunningJobs(),
        recentJobs: jobManager.getJobsStatus().slice(0, 10), // Últimos 10
        health: jobManager.getHealthStatus(),
      },
      configuration: {
        syncInterval: `${this.config.SYNC_INTERVAL_MINUTES} minutos`,
        healthCheckInterval: `${this.config.HEALTH_CHECK_INTERVAL_MINUTES} minutos`,
        maxConcurrentJobs: this.config.MAX_CONCURRENT_JOBS,
        retentionDays: this.config.JOB_LOGS_RETENTION_DAYS,
      },
    };
  }

  /**
   * Obtém métricas de performance dos jobs
   */
  getJobMetrics(): {
    [key in JobType]?: JobMetrics;
  } {
    const allMetrics = jobManager.getMetrics() as Map<JobType, JobMetrics>;
    const result: { [key in JobType]?: JobMetrics } = {};

    for (const [jobType, metrics] of allMetrics) {
      result[jobType] = {
        ...metrics,
        // Adicionar campos calculados
        successRate:
          metrics.totalRuns > 0
            ? Math.round((metrics.successfulRuns / metrics.totalRuns) * 100)
            : 0,
        avgDurationFormatted: this.formatDuration(metrics.averageDuration),
      } as JobMetrics & { successRate: number; avgDurationFormatted: string };
    }

    return result;
  }

  /**
   * Força execução imediata de job específico
   */
  async triggerJob(jobType: JobType): Promise<{
    status: 'success' | 'error';
    message: string;
    jobId?: string;
    timestamp: string;
  }> {
    try {
      let result;

      switch (jobType) {
        case JobType.SYNC_PAYMENTS:
          result = await scheduler.triggerSyncNow();
          break;
        case JobType.HEALTH_CHECK:
          result = await scheduler.triggerHealthCheckNow();
          break;
        default:
          throw new Error(
            `Job type ${jobType} não suportado para execução manual`
          );
      }

      return {
        status: 'success',
        message: `Job ${jobType} executado com sucesso`,
        jobId: result.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        message: `Erro ao executar job ${jobType}: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Controla o scheduler (start/stop)
   */
  controlScheduler(action: 'start' | 'stop'): {
    status: 'success' | 'error';
    message: string;
    schedulerStatus: any;
    timestamp: string;
  } {
    try {
      if (action === 'start') {
        scheduler.start();
      } else if (action === 'stop') {
        scheduler.stop();
      }

      return {
        status: 'success',
        message: `Scheduler ${
          action === 'start' ? 'iniciado' : 'parado'
        } com sucesso`,
        schedulerStatus: scheduler.getStatus(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        message: `Erro ao ${
          action === 'start' ? 'iniciar' : 'parar'
        } scheduler: ${errorMessage}`,
        schedulerStatus: scheduler.getStatus(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Limpa jobs antigos manualmente
   */
  cleanupJobs(): {
    status: 'success' | 'error';
    message: string;
    timestamp: string;
  } {
    try {
      jobManager.cleanupOldJobs();

      return {
        status: 'success',
        message: 'Limpeza de jobs executada com sucesso',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        message: `Erro na limpeza de jobs: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtém logs recentes de jobs (para debugging)
   */
  getJobLogs(limit: number = 50): {
    jobs: JobStatus[];
    summary: {
      total: number;
      running: number;
      completed: number;
      failed: number;
    };
  } {
    const jobs = jobManager.getJobsStatus().slice(0, limit);

    const summary = {
      total: jobs.length,
      running: jobs.filter((j) => j.status === 'running').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
    };

    return { jobs, summary };
  }

  // Utilitários privados
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  }
}
