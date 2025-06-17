// packages/api/src/jobs/job-manager.ts
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import {
  getJobsConfig,
  JobMetrics,
  JobStatus,
  JobType,
} from '../config/jobs.config';

/**
 * Gerenciador Central de Jobs
 *
 * Responsável por:
 * - Controlar execução de jobs
 * - Gerenciar concorrência
 * - Monitorar performance
 * - Retry automático
 * - Logging estruturado
 *
 * Padrão usado em grandes projetos para orchestração de jobs.
 */

interface JobDefinition {
  type: JobType;
  name: string;
  execute: () => Promise<any>;
  maxRetries?: number;
  retryDelay?: number;
}

export class JobManager extends EventEmitter {
  private jobs: Map<string, JobStatus> = new Map();
  private metrics: Map<JobType, JobMetrics> = new Map();
  private runningJobs: Set<string> = new Set();
  private config = getJobsConfig();

  constructor() {
    super();
    console.log('🎯 JobManager inicializado com configurações:', this.config);
  }

  /**
   * Executa um job com controle completo de lifecycle
   */
  async executeJob(jobDef: JobDefinition): Promise<JobStatus> {
    const jobId = randomUUID();
    const startTime = new Date();

    // Verificar limite de concorrência
    if (this.runningJobs.size >= this.config.MAX_CONCURRENT_JOBS) {
      throw new Error(
        `Limite de jobs concorrentes atingido: ${this.config.MAX_CONCURRENT_JOBS}`
      );
    }

    // Criar status inicial
    const jobStatus: JobStatus = {
      id: jobId,
      type: jobDef.type,
      status: 'running',
      startTime,
      retryCount: 0,
    };

    this.jobs.set(jobId, jobStatus);
    this.runningJobs.add(jobId);

    console.log(`🚀 Iniciando job ${jobDef.name} (${jobId})`);
    this.emit('job:started', jobStatus);

    try {
      // Executar job com retry automático
      const result = await this.executeWithRetry(jobDef, jobStatus);

      // Job executado com sucesso
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      jobStatus.status = 'completed';
      jobStatus.endTime = endTime;
      jobStatus.duration = duration;
      jobStatus.result = result;

      console.log(`✅ Job ${jobDef.name} concluído em ${duration}ms`);
      this.emit('job:completed', jobStatus);

      // Atualizar métricas
      this.updateMetrics(jobDef.type, true, duration);

      return jobStatus;
    } catch (error) {
      // Job falhou após todas as tentativas
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      jobStatus.status = 'failed';
      jobStatus.endTime = endTime;
      jobStatus.duration = duration;
      jobStatus.error = errorMessage;

      console.error(`❌ Job ${jobDef.name} falhou: ${errorMessage}`);
      this.emit('job:failed', jobStatus);

      // Atualizar métricas
      this.updateMetrics(jobDef.type, false, duration, errorMessage);

      throw error;
    } finally {
      this.runningJobs.delete(jobId);
    }
  }

  /**
   * Executa job com retry automático
   */
  private async executeWithRetry(
    jobDef: JobDefinition,
    jobStatus: JobStatus
  ): Promise<any> {
    const maxRetries = jobDef.maxRetries || this.config.SYNC_MAX_RETRIES;
    const retryDelay = jobDef.retryDelay || this.config.SYNC_RETRY_DELAY_MS;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        jobStatus.retryCount = attempt;

        if (attempt > 0) {
          console.log(
            `🔄 Tentativa ${attempt}/${maxRetries} para job ${jobDef.name}`
          );
          await this.sleep(retryDelay);
        }

        return await jobDef.execute();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `⚠️ Tentativa ${attempt + 1} falhou: ${lastError.message}`
        );

        if (attempt === maxRetries) {
          break; // Última tentativa, não fazer retry
        }
      }
    }

    throw lastError;
  }

  /**
   * Atualiza métricas de performance
   */
  private updateMetrics(
    jobType: JobType,
    success: boolean,
    duration: number,
    errorMessage?: string
  ): void {
    const current = this.metrics.get(jobType) || {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageDuration: 0,
      lastRun: new Date(),
      lastSuccess: new Date(0),
    };

    current.totalRuns++;
    current.lastRun = new Date();

    if (success) {
      current.successfulRuns++;
      current.lastSuccess = new Date();
    } else {
      current.failedRuns++;
      if (errorMessage) {
        current.lastError = {
          message: errorMessage,
          timestamp: new Date(),
        };
      }
    }

    // Calcular média de duração (média móvel simples)
    current.averageDuration = Math.round(
      (current.averageDuration * (current.totalRuns - 1) + duration) /
        current.totalRuns
    );

    this.metrics.set(jobType, current);
  }

  /**
   * Obtém status de todos os jobs
   */
  getJobsStatus(): JobStatus[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 50); // Últimos 50 jobs
  }

  /**
   * Obtém métricas por tipo de job
   */
  getMetrics(jobType?: JobType): JobMetrics | Map<JobType, JobMetrics> {
    if (jobType) {
      return (
        this.metrics.get(jobType) || {
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          averageDuration: 0,
          lastRun: new Date(0),
          lastSuccess: new Date(0),
        }
      );
    }
    return new Map(this.metrics);
  }

  /**
   * Obtém jobs em execução
   */
  getRunningJobs(): JobStatus[] {
    return Array.from(this.runningJobs)
      .map((id) => this.jobs.get(id))
      .filter(Boolean) as JobStatus[];
  }

  /**
   * Verifica saúde geral dos jobs
   */
  getHealthStatus(): {
    healthy: boolean;
    runningJobs: number;
    lastErrors: Array<{ type: JobType; error: string; timestamp: Date }>;
    uptime: string;
  } {
    const runningCount = this.runningJobs.size;
    const lastErrors: Array<{ type: JobType; error: string; timestamp: Date }> =
      [];

    // Coletar erros recentes (últimas 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const [type, metrics] of this.metrics) {
      if (metrics.lastError && metrics.lastError.timestamp > yesterday) {
        lastErrors.push({
          type,
          error: metrics.lastError.message,
          timestamp: metrics.lastError.timestamp,
        });
      }
    }

    const healthy =
      runningCount < this.config.MAX_CONCURRENT_JOBS && lastErrors.length < 5;

    return {
      healthy,
      runningJobs: runningCount,
      lastErrors: lastErrors.slice(0, 10), // Últimos 10 erros
      uptime: this.formatUptime(process.uptime() * 1000),
    };
  }

  /**
   * Limpa jobs antigos (garbage collection)
   */
  cleanupOldJobs(): void {
    const retentionMs =
      this.config.JOB_LOGS_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - retentionMs);

    let removed = 0;
    for (const [id, job] of this.jobs) {
      if (job.endTime && job.endTime < cutoff) {
        this.jobs.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Limpeza de jobs: ${removed} jobs antigos removidos`);
    }
  }

  // Utilitários privados
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatUptime(uptimeMs: number): string {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Instância singleton do JobManager
export const jobManager = new JobManager();
