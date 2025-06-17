// packages/api/src/jobs/health-check.job.ts
import { getJobsConfig, JobType } from '../config/jobs.config';
import { oracleDataSource, pgDataSource } from '../lib/typeorm';
import { jobManager } from './job-manager';

/**
 * Job de Monitoramento de Saúde do Sistema
 *
 * Verifica periodicamente:
 * - Conectividade Oracle
 * - Conectividade PostgreSQL
 * - Performance das consultas
 * - Status geral do sistema
 *
 * Usado para alertas proativos e detecção precoce de problemas.
 */

interface HealthCheckResult {
  timestamp: Date;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  databases: {
    postgresql: DatabaseHealth;
    oracle: DatabaseHealth;
  };
  system: SystemHealth;
  recommendations: string[];
}

interface DatabaseHealth {
  status: 'connected' | 'slow' | 'disconnected' | 'error';
  responseTime: number;
  lastError?: string;
  connectionPool?: {
    active: number;
    idle: number;
    total: number;
  };
}

interface SystemHealth {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  jobsStatus: 'normal' | 'overloaded' | 'stuck';
}

export class HealthCheckJob {
  private config = getJobsConfig();

  /**
   * Executa verificação completa de saúde
   */
  async execute(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    console.log('🔍 Iniciando health check do sistema...');

    const result: HealthCheckResult = {
      timestamp: new Date(),
      overall: 'healthy',
      databases: {
        postgresql: await this.checkPostgreSQL(),
        oracle: await this.checkOracle(),
      },
      system: await this.checkSystemHealth(),
      recommendations: [],
    };

    // Determinar status geral e recomendações
    this.evaluateOverallHealth(result);

    const duration = Date.now() - startTime;
    console.log(
      `✅ Health check concluído em ${duration}ms - Status: ${result.overall}`
    );

    // Log de problemas críticos
    if (result.overall === 'unhealthy') {
      console.error(
        '🚨 Sistema com problemas críticos:',
        result.recommendations
      );
    } else if (result.overall === 'degraded') {
      console.warn('⚠️ Sistema com degradação:', result.recommendations);
    }

    return result;
  }

  /**
   * Verifica saúde do PostgreSQL
   */
  private async checkPostgreSQL(): Promise<DatabaseHealth> {
    const startTime = Date.now();

    try {
      // Teste de conectividade simples
      await pgDataSource.query('SELECT 1 as test');
      const responseTime = Date.now() - startTime;

      // Verificar pool de conexões
      const pool = (pgDataSource.driver as any).master;
      let poolInfo:
        | { active: number; idle: number; total: number }
        | undefined = undefined;

      if (
        pool &&
        typeof pool.totalCount === 'number' &&
        typeof pool.idleCount === 'number'
      ) {
        poolInfo = {
          active: pool.totalCount - pool.idleCount,
          idle: pool.idleCount,
          total: pool.totalCount,
        };
      }

      const result: DatabaseHealth = {
        status: responseTime > 1000 ? 'slow' : 'connected',
        responseTime,
      };

      if (poolInfo !== undefined) {
        result.connectionPool = poolInfo;
      }

      return result;
    } catch (error) {
      console.error('❌ PostgreSQL health check falhou:', error);
      return {
        status: 'error',
        responseTime: Date.now() - startTime,
        lastError: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verifica saúde do Oracle
   */
  private async checkOracle(): Promise<DatabaseHealth> {
    const startTime = Date.now();

    try {
      // Teste de conectividade com timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Oracle timeout')),
          this.config.ORACLE_TIMEOUT_MS
        );
      });

      const queryPromise = oracleDataSource.query('SELECT 1 as test FROM DUAL');

      await Promise.race([queryPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 2000 ? 'slow' : 'connected',
        responseTime,
      };
    } catch (error) {
      console.error('❌ Oracle health check falhou:', error);
      const responseTime = Date.now() - startTime;

      return {
        status:
          error instanceof Error && error.message.includes('timeout')
            ? 'disconnected'
            : 'error',
        responseTime,
        lastError: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verifica saúde do sistema
   */
  private async checkSystemHealth(): Promise<SystemHealth> {
    const memUsage = process.memoryUsage();
    const jobsStatus = this.evaluateJobsHealth();

    return {
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      uptime: Math.floor(process.uptime()),
      jobsStatus,
    };
  }

  /**
   * Avalia saúde dos jobs
   */
  private evaluateJobsHealth(): 'normal' | 'overloaded' | 'stuck' {
    const runningJobs = jobManager.getRunningJobs();
    const maxConcurrent = this.config.MAX_CONCURRENT_JOBS;

    if (runningJobs.length >= maxConcurrent) {
      return 'overloaded';
    }

    // Verificar se há jobs presos (rodando por mais de 30 minutos)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const stuckJobs = runningJobs.filter(
      (job) => job.startTime < thirtyMinutesAgo
    );

    if (stuckJobs.length > 0) {
      return 'stuck';
    }

    return 'normal';
  }

  /**
   * Avalia status geral e gera recomendações
   */
  private evaluateOverallHealth(result: HealthCheckResult): void {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Verificar bancos de dados
    if (result.databases.postgresql.status === 'error') {
      issues.push('PostgreSQL inacessível - sistema pode falhar');
    } else if (result.databases.postgresql.status === 'slow') {
      warnings.push('PostgreSQL lento - verificar performance');
    }

    if (
      result.databases.oracle.status === 'error' ||
      result.databases.oracle.status === 'disconnected'
    ) {
      warnings.push('Oracle inacessível - funcionando em modo cache');
    } else if (result.databases.oracle.status === 'slow') {
      warnings.push('Oracle lento - sincronização pode ser afetada');
    }

    // Verificar sistema
    if (result.system.memoryUsage.percentage > 90) {
      issues.push('Memória crítica (>90%) - risco de instabilidade');
    } else if (result.system.memoryUsage.percentage > 80) {
      warnings.push('Uso de memória alto (>80%) - monitorar');
    }

    if (result.system.jobsStatus === 'stuck') {
      issues.push('Jobs presos detectados - verificar logs');
    } else if (result.system.jobsStatus === 'overloaded') {
      warnings.push('Sistema sobrecarregado - muitos jobs simultâneos');
    }

    // Determinar status geral
    if (issues.length > 0) {
      result.overall = 'unhealthy';
      result.recommendations = [...issues, ...warnings];
    } else if (warnings.length > 0) {
      result.overall = 'degraded';
      result.recommendations = warnings;
    } else {
      result.overall = 'healthy';
      result.recommendations = ['Sistema funcionando normalmente'];
    }
  }
}

/**
 * Função utilitária para executar health check via JobManager
 */
export async function executeHealthCheck(): Promise<any> {
  const healthCheckJob = new HealthCheckJob();

  return jobManager.executeJob({
    type: JobType.HEALTH_CHECK,
    name: 'Health Check do Sistema',
    execute: () => healthCheckJob.execute(),
    maxRetries: 1, // Health check não precisa de muitos retries
    retryDelay: 2000,
  });
}

/**
 * Função para health check simples (sem JobManager)
 */
export async function quickHealthCheck(): Promise<{
  status: 'ok' | 'degraded' | 'error';
  message: string;
}> {
  try {
    const healthCheckJob = new HealthCheckJob();
    const result = await healthCheckJob.execute();

    return {
      status:
        result.overall === 'healthy'
          ? 'ok'
          : result.overall === 'degraded'
          ? 'degraded'
          : 'error',
      message: result.recommendations.join(', '),
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Health check falhou',
    };
  }
}
