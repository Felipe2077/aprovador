// packages/api/src/config/jobs.config.ts
import { Type } from '@sinclair/typebox';

/**
 * Configurações dos Jobs do Sistema
 *
 * Define intervalos, configurações e comportamentos dos jobs automatizados
 * seguindo padrões de grandes projetos com flexibilidade de configuração.
 */

// Tipos de configuração
export const JobsConfigSchema = Type.Object({
  // Configurações de sincronização
  SYNC_INTERVAL_MINUTES: Type.Number({
    default: 15,
    minimum: 1,
    maximum: 1440,
  }),
  SYNC_BATCH_SIZE: Type.Number({ default: 100, minimum: 10, maximum: 1000 }),
  SYNC_MAX_RETRIES: Type.Number({ default: 3, minimum: 1, maximum: 10 }),
  SYNC_RETRY_DELAY_MS: Type.Number({
    default: 5000,
    minimum: 1000,
    maximum: 60000,
  }),

  // Configurações de health check
  HEALTH_CHECK_INTERVAL_MINUTES: Type.Number({
    default: 5,
    minimum: 1,
    maximum: 60,
  }),
  ORACLE_TIMEOUT_MS: Type.Number({
    default: 30000,
    minimum: 5000,
    maximum: 120000,
  }),

  // Configurações de logs e monitoramento
  JOB_LOGS_RETENTION_DAYS: Type.Number({
    default: 30,
    minimum: 7,
    maximum: 365,
  }),
  ENABLE_JOB_METRICS: Type.Boolean({ default: true }),

  // Configurações de performance
  MAX_CONCURRENT_JOBS: Type.Number({ default: 3, minimum: 1, maximum: 10 }),
  JOB_MEMORY_LIMIT_MB: Type.Number({
    default: 512,
    minimum: 128,
    maximum: 2048,
  }),
});

// Interface tipada para as configurações
export interface JobsConfig {
  SYNC_INTERVAL_MINUTES: number;
  SYNC_BATCH_SIZE: number;
  SYNC_MAX_RETRIES: number;
  SYNC_RETRY_DELAY_MS: number;
  HEALTH_CHECK_INTERVAL_MINUTES: number;
  ORACLE_TIMEOUT_MS: number;
  JOB_LOGS_RETENTION_DAYS: number;
  ENABLE_JOB_METRICS: boolean;
  MAX_CONCURRENT_JOBS: number;
  JOB_MEMORY_LIMIT_MB: number;
}

// Configurações padrão (podem ser sobrescritas via env)
export const DEFAULT_JOBS_CONFIG: JobsConfig = {
  SYNC_INTERVAL_MINUTES: 15,
  SYNC_BATCH_SIZE: 100,
  SYNC_MAX_RETRIES: 3,
  SYNC_RETRY_DELAY_MS: 5000,
  HEALTH_CHECK_INTERVAL_MINUTES: 5,
  ORACLE_TIMEOUT_MS: 30000,
  JOB_LOGS_RETENTION_DAYS: 30,
  ENABLE_JOB_METRICS: true,
  MAX_CONCURRENT_JOBS: 3,
  JOB_MEMORY_LIMIT_MB: 512,
};

// Função para carregar configurações (com fallback para defaults)
export function getJobsConfig(): JobsConfig {
  return {
    SYNC_INTERVAL_MINUTES: parseInt(process.env.SYNC_INTERVAL_MINUTES || '15'),
    SYNC_BATCH_SIZE: parseInt(process.env.SYNC_BATCH_SIZE || '100'),
    SYNC_MAX_RETRIES: parseInt(process.env.SYNC_MAX_RETRIES || '3'),
    SYNC_RETRY_DELAY_MS: parseInt(process.env.SYNC_RETRY_DELAY_MS || '5000'),
    HEALTH_CHECK_INTERVAL_MINUTES: parseInt(
      process.env.HEALTH_CHECK_INTERVAL_MINUTES || '5'
    ),
    ORACLE_TIMEOUT_MS: parseInt(process.env.ORACLE_TIMEOUT_MS || '30000'),
    JOB_LOGS_RETENTION_DAYS: parseInt(
      process.env.JOB_LOGS_RETENTION_DAYS || '30'
    ),
    ENABLE_JOB_METRICS: process.env.ENABLE_JOB_METRICS !== 'false',
    MAX_CONCURRENT_JOBS: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
    JOB_MEMORY_LIMIT_MB: parseInt(process.env.JOB_MEMORY_LIMIT_MB || '512'),
  };
}

// Enum para tipos de jobs
export enum JobType {
  SYNC_PAYMENTS = 'sync_payments',
  HEALTH_CHECK = 'health_check',
  CLEANUP_LOGS = 'cleanup_logs',
  MAINTENANCE = 'maintenance',
}

// Interface para status de jobs
export interface JobStatus {
  id: string;
  type: JobType;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
  retryCount: number;
  nextRun?: Date;
}

// Interface para métricas de jobs
export interface JobMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  lastRun: Date;
  lastSuccess: Date;
  lastError?: {
    message: string;
    timestamp: Date;
  };
}
