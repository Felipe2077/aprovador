// packages/api/src/jobs/scheduler.ts
import { getJobsConfig } from '../config/jobs.config';
import { executeHealthCheck } from './health-check.job';
import { jobManager } from './job-manager';
import { executeSyncJob } from './sync.job';

/**
 * Sistema de Agendamento Principal
 *
 * Responsável por agendar e executar jobs de forma automática.
 * Implementa padrões de scheduler robustos usado em grandes projetos:
 * - Execução baseada em intervalos
 * - Prevenção de sobreposição
 * - Recovery automático
 * - Graceful shutdown
 */

export class Scheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private config = getJobsConfig();

  constructor() {
    console.log('📅 Scheduler inicializado');

    // Listener para graceful shutdown
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());
  }

  /**
   * Inicia todos os jobs agendados
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ Scheduler já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando scheduler de jobs...');

    // Agendar job de sincronização
    this.scheduleSync();

    // Agendar health check
    this.scheduleHealthCheck();

    // Agendar limpeza de jobs antigos (diário)
    this.scheduleCleanup();

    // Executar uma sincronização inicial após 30 segundos
    setTimeout(() => {
      if (this.isRunning) {
        console.log('🔄 Executando sincronização inicial...');
        this.executeSyncSafely();
      }
    }, 30000);

    console.log('✅ Scheduler iniciado com sucesso');
    this.logScheduledJobs();
  }

  /**
   * Para todos os jobs agendados
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('🛑 Parando scheduler...');
    this.isRunning = false;

    // Limpar todos os intervalos
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`⏹️ Job ${name} parado`);
    }

    this.intervals.clear();
    console.log('✅ Scheduler parado com sucesso');
  }

  /**
   * Agenda job de sincronização Oracle → PostgreSQL
   */
  private scheduleSync(): void {
    const intervalMs = this.config.SYNC_INTERVAL_MINUTES * 60 * 1000;

    const interval = setInterval(() => {
      if (this.isRunning) {
        this.executeSyncSafely();
      }
    }, intervalMs);

    this.intervals.set('sync', interval);
    console.log(
      `📅 Sincronização agendada: a cada ${this.config.SYNC_INTERVAL_MINUTES} minutos`
    );
  }

  /**
   * Agenda health check do sistema
   */
  private scheduleHealthCheck(): void {
    const intervalMs = this.config.HEALTH_CHECK_INTERVAL_MINUTES * 60 * 1000;

    const interval = setInterval(() => {
      if (this.isRunning) {
        this.executeHealthCheckSafely();
      }
    }, intervalMs);

    this.intervals.set('health-check', interval);
    console.log(
      `📅 Health check agendado: a cada ${this.config.HEALTH_CHECK_INTERVAL_MINUTES} minutos`
    );
  }

  /**
   * Agenda limpeza de jobs antigos (diário às 02:00)
   */
  private scheduleCleanup(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 02:00 AM

    const msUntilTomorrow = tomorrow.getTime() - now.getTime();

    // Primeira execução amanhã às 02:00
    setTimeout(() => {
      if (this.isRunning) {
        this.executeCleanupSafely();

        // Depois executar diariamente
        const dailyInterval = setInterval(() => {
          if (this.isRunning) {
            this.executeCleanupSafely();
          }
        }, 24 * 60 * 60 * 1000); // 24 horas

        this.intervals.set('cleanup', dailyInterval);
      }
    }, msUntilTomorrow);

    console.log(
      `📅 Limpeza agendada: diariamente às 02:00 (próxima em ${Math.round(
        msUntilTomorrow / 1000 / 60
      )} minutos)`
    );
  }

  /**
   * Executa sincronização com proteção contra erros
   */
  private async executeSyncSafely(): Promise<void> {
    try {
      await executeSyncJob();
    } catch (error) {
      console.error('❌ Erro na execução agendada de sincronização:', error);
      // Scheduler continua funcionando mesmo com erro
    }
  }

  /**
   * Executa health check com proteção contra erros
   */
  private async executeHealthCheckSafely(): Promise<void> {
    try {
      const result = await executeHealthCheck();

      // Verificar se precisa de ação
      if (result.result.overall === 'unhealthy') {
        console.error(
          '🚨 Sistema com problemas críticos detectados pelo health check'
        );
        // Aqui poderia enviar alertas, notifications, etc.
      }
    } catch (error) {
      console.error('❌ Erro na execução de health check:', error);
    }
  }

  /**
   * Executa limpeza com proteção contra erros
   */
  private async executeCleanupSafely(): Promise<void> {
    try {
      console.log('🧹 Executando limpeza de jobs antigos...');
      jobManager.cleanupOldJobs();
      console.log('✅ Limpeza concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza de jobs:', error);
    }
  }

  /**
   * Força execução imediata de sincronização
   */
  async triggerSyncNow(): Promise<any> {
    console.log('🔥 Sincronização forçada solicitada');
    return executeSyncJob();
  }

  /**
   * Força execução imediata de health check
   */
  async triggerHealthCheckNow(): Promise<any> {
    console.log('🔥 Health check forçado solicitado');
    return executeHealthCheck();
  }

  /**
   * Obtém status do scheduler
   */
  getStatus(): {
    running: boolean;
    scheduledJobs: Array<{
      name: string;
      nextRun: string;
      interval: string;
    }>;
    uptime: string;
  } {
    const jobs = [];

    if (this.intervals.has('sync')) {
      jobs.push({
        name: 'Sincronização Oracle → PostgreSQL',
        interval: `${this.config.SYNC_INTERVAL_MINUTES} minutos`,
        nextRun: 'próxima execução baseada no intervalo',
      });
    }

    if (this.intervals.has('health-check')) {
      jobs.push({
        name: 'Health Check do Sistema',
        interval: `${this.config.HEALTH_CHECK_INTERVAL_MINUTES} minutos`,
        nextRun: 'próxima execução baseada no intervalo',
      });
    }

    if (this.intervals.has('cleanup')) {
      jobs.push({
        name: 'Limpeza de Jobs Antigos',
        interval: 'diário às 02:00',
        nextRun: 'próxima execução às 02:00',
      });
    }

    return {
      running: this.isRunning,
      scheduledJobs: jobs,
      uptime: this.formatUptime(process.uptime() * 1000),
    };
  }

  /**
   * Log dos jobs agendados
   */
  private logScheduledJobs(): void {
    console.log('📋 Jobs agendados:');
    console.log(
      `  • Sincronização: a cada ${this.config.SYNC_INTERVAL_MINUTES} minutos`
    );
    console.log(
      `  • Health Check: a cada ${this.config.HEALTH_CHECK_INTERVAL_MINUTES} minutos`
    );
    console.log(`  • Limpeza: diariamente às 02:00`);
  }

  /**
   * Formata tempo de execução
   */
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

// Instância singleton do Scheduler
export const scheduler = new Scheduler();
