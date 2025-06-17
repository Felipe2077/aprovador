// packages/api/src/jobs/sync.job.ts
import { getJobsConfig, JobType } from '../config/jobs.config';
import { SyncService } from '../services/etl/sync.service';
import { jobManager } from './job-manager';

/**
 * Job de Sincronização Oracle → PostgreSQL
 *
 * Executa sincronização automática dos dados do ERP Oracle
 * para o cache PostgreSQL, garantindo que o sistema sempre
 * tenha dados atualizados para operação autônoma.
 *
 * Padrão de job usado em grandes projetos para ETL automatizado.
 */

export class SyncJob {
  private syncService: SyncService;
  private config = getJobsConfig();

  constructor() {
    this.syncService = new SyncService();
  }

  /**
   * Executa sincronização completa
   */
  async execute(): Promise<{
    success: boolean;
    stats: any;
    duration: number;
    message: string;
  }> {
    const startTime = Date.now();

    console.log('🔄 Iniciando sincronização automática Oracle → PostgreSQL...');

    try {
      // Executar sincronização com configurações do job
      const stats = await this.syncService.syncPayments(this.getDaysToSync());

      const duration = Date.now() - startTime;
      const message = this.buildSuccessMessage(stats, duration);

      console.log('✅ Sincronização automática concluída:', message);

      return {
        success: true,
        stats,
        duration,
        message,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error('❌ Erro na sincronização automática:', errorMessage);

      // Re-throw para que o JobManager trate o retry
      throw new Error(
        `Sincronização falhou após ${duration}ms: ${errorMessage}`
      );
    }
  }

  /**
   * Determina quantos dias sincronizar baseado na frequência
   */
  private getDaysToSync(): number {
    const intervalMinutes = this.config.SYNC_INTERVAL_MINUTES;

    // Se executa a cada 15 minutos, sincronizar último dia
    // Se executa mais esporadicamente, sincronizar mais dias
    if (intervalMinutes <= 15) return 1;
    if (intervalMinutes <= 60) return 2;
    if (intervalMinutes <= 240) return 7;
    return 14; // Para intervalos muito longos
  }

  /**
   * Constrói mensagem de sucesso detalhada
   */
  private buildSuccessMessage(stats: any, duration: number): string {
    const parts = [
      `${stats.total} registros processados`,
      `${stats.created} criados`,
      `${stats.updated} atualizados`,
      `${stats.skipped} ignorados`,
    ];

    if (stats.errors > 0) {
      parts.push(`${stats.errors} erros`);
    }

    return `${parts.join(', ')} em ${duration}ms`;
  }
}

/**
 * Função utilitária para executar sincronização via JobManager
 */
export async function executeSyncJob(): Promise<any> {
  const syncJob = new SyncJob();

  return jobManager.executeJob({
    type: JobType.SYNC_PAYMENTS,
    name: 'Sincronização Oracle → PostgreSQL',
    execute: () => syncJob.execute(),
    maxRetries: 3,
    retryDelay: 5000,
  });
}

/**
 * Função para executar sincronização de emergência
 * (sem usar o JobManager, para situações críticas)
 */
export async function executeEmergencySync(): Promise<any> {
  console.log('🚨 Executando sincronização de emergência...');

  const syncJob = new SyncJob();

  try {
    const result = await syncJob.execute();
    console.log('✅ Sincronização de emergência concluída');
    return result;
  } catch (error) {
    console.error('❌ Sincronização de emergência falhou:', error);
    throw error;
  }
}
