// packages/api/src/services/etl/sync.service.ts - VERSÃO HÍBRIDA COMPLETA
import { PaymentStatus } from 'shared-types';
import { IsNull, Not } from 'typeorm';
import { Payment } from '../../entities/postgresql/Payment.entity';
import { User } from '../../entities/postgresql/User.entity';
import { oracleDataSource, pgDataSource } from '../../lib/typeorm';
import { OraclePaymentData, PaymentMapperService } from './mapper.service';
import { UserSyncService } from './user-sync.service';

/**
 * Serviço de Sincronização Híbrida Oracle → PostgreSQL
 *
 * Nova lógica:
 * 1. Para cada AP do Oracle, valida/cria usuário automaticamente
 * 2. Sempre sincroniza a AP (mesmo sem usuário local)
 * 3. Vincula AP ao usuário se ele existir/for criado
 * 4. APs órfãs ficam disponíveis até usuário ativar conta
 *
 * Resultado: 0 ignorados, todos os dados sincronizados!
 */

export class SyncService {
  private paymentRepo = pgDataSource.getRepository(Payment);
  private userRepo = pgDataSource.getRepository(User);
  private userSyncService = new UserSyncService();

  /**
   * Buscar APs novas/atualizadas do Oracle (mesma query anterior)
   */
  async getOraclePayments(sinceDays: number = 7): Promise<OraclePaymentData[]> {
    try {
      console.log(`🔍 Buscando APs do Oracle dos últimos ${sinceDays} dias...`);

      const query = `
        SELECT 
          c.CODDOCTOCPG,
          c.USUARIO,
          c.DATA_INCLUSAO,
          c.FAVORECIDODOCTOCPG,
          c.STATUSDOCTOCPG,
          c.QUITADODOCTOCPG,
          c.PAGAMENTOLIBERADO,
          c.VENCIMENTOCPG,
          c.NRODOCTOCPG,
          f.NFANTASIAFORN,
          u.NOMEUSUARIO,
          h.VLR_BRUTO
        FROM GLOBUS.CPGDOCTO c
        LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
        LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = c.USUARIO
        LEFT JOIN (
          SELECT 
            CODDOCTOCPG, 
            FIRST_VALUE(VLR_BRUTO) OVER (
              PARTITION BY CODDOCTOCPG 
              ORDER BY DATA_EVENTO DESC, SEQUENCIA_EVENTO DESC
              ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
            ) as VLR_BRUTO
          FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
          WHERE VLR_BRUTO > 0
        ) h ON h.CODDOCTOCPG = c.CODDOCTOCPG
        WHERE c.DATA_INCLUSAO >= SYSDATE - :sinceDays
        ORDER BY c.DATA_INCLUSAO DESC
      `;

      const oraclePayments = await oracleDataSource.query(query, [sinceDays]);

      console.log(`✅ ${oraclePayments.length} APs encontradas no Oracle`);
      return oraclePayments;
    } catch (error) {
      console.error('❌ Erro ao buscar APs do Oracle:', error);
      throw error;
    }
  }

  /**
   * Verifica se payment já existe no PostgreSQL
   */
  async paymentExists(erpPaymentId: number): Promise<Payment | null> {
    return await this.paymentRepo.findOne({
      where: { erpPaymentId },
    });
  }

  /**
   * ✨ NOVA LÓGICA: Cria payment do Oracle com usuário inteligente
   */
  async createPaymentFromOracle(
    oracleData: OraclePaymentData
  ): Promise<Payment | null> {
    try {
      console.log(
        `🆕 Criando payment ERP ${oracleData.CODDOCTOCPG} (${oracleData.USUARIO})`
      );

      // 1. ✨ NOVA FUNCIONALIDADE: Encontrar ou criar usuário
      const user = await this.userSyncService.findOrCreateUserFromOracle(
        oracleData.USUARIO
      );

      // 2. Mapear dados Oracle → Payment
      const mappedData = PaymentMapperService.mapOracleToPayment(oracleData);

      // 3. Criar payment
      const payment = new Payment();
      payment.amount = mappedData.amount;
      payment.currency = mappedData.currency;
      payment.payee = mappedData.payee;
      payment.description = mappedData.description;
      payment.status = PaymentStatus.SCHEDULED; // 🆕 Status padrão para APs do Oracle

      // 4. ✨ CAMPOS ORACLE sempre preenchidos
      payment.erpPaymentId = oracleData.CODDOCTOCPG;
      payment.requesterUsername = oracleData.USUARIO.toUpperCase();
      payment.requesterName = oracleData.NOMEUSUARIO || oracleData.USUARIO;
      payment.erpDocumentNumber = oracleData.NRODOCTOCPG || null;
      payment.erpSupplierName = oracleData.NFANTASIAFORN || null;
      payment.lastOracleSync = new Date();

      // 5. ✨ VINCULAÇÃO INTELIGENTE: Se usuário existe, vincula
      if (user) {
        payment.requesterId = user.id;
        console.log(
          `🔗 Payment vinculado ao usuário ${user.username} (${user.id})`
        );
      } else {
        payment.requesterId = null;
        console.log(
          `⚠️ Payment ficará órfão até usuário ${oracleData.USUARIO} ativar conta`
        );
      }

      // 6. Campos opcionais
      if (mappedData.dueDate) {
        payment.dueDate = mappedData.dueDate;
      }

      // 7. Metadados para rastreabilidade completa
      payment.erpMetadata = {
        originalStatus: oracleData.STATUSDOCTOCPG,
        quitado: oracleData.QUITADODOCTOCPG,
        liberado: oracleData.PAGAMENTOLIBERADO,
        documentNumber: oracleData.NRODOCTOCPG,
        supplierName: oracleData.NFANTASIAFORN,
        requesterName: oracleData.NOMEUSUARIO,
        syncDate: new Date(),
      };

      const savedPayment = await this.paymentRepo.save(payment);

      console.log(
        `✅ Payment ${savedPayment.id} criado (ERP: ${oracleData.CODDOCTOCPG})`
      );
      return savedPayment;
    } catch (error) {
      console.error(
        `❌ Erro ao criar payment para ERP ${oracleData.CODDOCTOCPG}:`,
        error
      );
      return null;
    }
  }

  /**
   * ✨ NOVA LÓGICA: Atualiza payment existente
   */
  async updatePaymentFromOracle(
    existingPayment: Payment,
    oracleData: OraclePaymentData
  ): Promise<Payment | null> {
    try {
      console.log(
        `📝 Atualizando payment ${existingPayment.id} (ERP: ${oracleData.CODDOCTOCPG})`
      );

      const mappedData = PaymentMapperService.mapOracleToPayment(oracleData);

      // Atualizar apenas campos que podem ter mudado
      existingPayment.amount = mappedData.amount;
      existingPayment.requesterName =
        oracleData.NOMEUSUARIO || oracleData.USUARIO;
      existingPayment.erpSupplierName = oracleData.NFANTASIAFORN || null;
      existingPayment.lastOracleSync = new Date();

      // ✨ Se payment está órfão, tentar vincular usuário
      if (existingPayment.isOrphan()) {
        const user = await this.userSyncService.findOrCreateUserFromOracle(
          oracleData.USUARIO
        );
        if (user) {
          existingPayment.requesterId = user.id;
          console.log(
            `🔗 Payment órfão agora vinculado ao usuário ${user.username}`
          );
        }
      }

      // Atualizar campos opcionais
      if (mappedData.dueDate) {
        existingPayment.dueDate = mappedData.dueDate;
      }

      // Atualizar metadados
      existingPayment.erpMetadata = {
        ...existingPayment.erpMetadata,
        originalStatus: oracleData.STATUSDOCTOCPG,
        quitado: oracleData.QUITADODOCTOCPG,
        liberado: oracleData.PAGAMENTOLIBERADO,
        lastUpdate: new Date(),
      };

      const updatedPayment = await this.paymentRepo.save(existingPayment);
      console.log(`✅ Payment ${updatedPayment.id} atualizado`);

      return updatedPayment;
    } catch (error) {
      console.error(
        `❌ Erro ao atualizar payment para ERP ${oracleData.CODDOCTOCPG}:`,
        error
      );
      return null;
    }
  }

  /**
   * ✨ PROCESSO PRINCIPAL: Sincronização garantida
   */
  async syncPayments(sinceDays: number = 7): Promise<{
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    usersCreated: number;
    orphanPayments: number;
  }> {
    const stats = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      usersCreated: 0,
      orphanPayments: 0,
    };

    try {
      console.log('🔄 Iniciando sincronização HÍBRIDA Oracle → PostgreSQL...');

      // Contar usuários antes
      const userCountBefore = await this.userRepo.count();

      // Buscar dados do Oracle
      const oraclePayments = await this.getOraclePayments(sinceDays);
      stats.total = oraclePayments.length;

      for (const oraclePayment of oraclePayments) {
        try {
          // Verificar se já existe
          const existingPayment = await this.paymentExists(
            oraclePayment.CODDOCTOCPG
          );

          if (existingPayment) {
            // Atualizar existente
            const updated = await this.updatePaymentFromOracle(
              existingPayment,
              oraclePayment
            );
            if (updated) {
              stats.updated++;
              if (updated.isOrphan()) stats.orphanPayments++;
            } else {
              stats.errors++;
            }
          } else {
            // ✨ SEMPRE tenta criar (nova lógica!)
            const created = await this.createPaymentFromOracle(oraclePayment);
            if (created) {
              stats.created++;
              if (created.isOrphan()) stats.orphanPayments++;
            } else {
              stats.errors++;
            }
          }
        } catch (error) {
          console.error(
            `❌ Erro ao processar AP ${oraclePayment.CODDOCTOCPG}:`,
            error
          );
          stats.errors++;
        }
      }

      // Contar usuários criados
      const userCountAfter = await this.userRepo.count();
      stats.usersCreated = userCountAfter - userCountBefore;

      console.log('✅ Sincronização HÍBRIDA concluída:', stats);
      this.logSyncResults(stats);

      return stats;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Log detalhado dos resultados
   */
  private logSyncResults(stats: any): void {
    console.log('📊 ========== RESULTADO DA SINCRONIZAÇÃO ==========');
    console.log(`📥 Total processado: ${stats.total}`);
    console.log(`🆕 Criados: ${stats.created}`);
    console.log(`📝 Atualizados: ${stats.updated}`);
    console.log(`⏭️ Ignorados: ${stats.skipped}`);
    console.log(`❌ Erros: ${stats.errors}`);
    console.log(`👤 Usuários criados: ${stats.usersCreated}`);
    console.log(`🏷️ APs órfãs: ${stats.orphanPayments}`);
    console.log('================================================');

    if (stats.usersCreated > 0) {
      console.log(
        `✨ ${stats.usersCreated} usuários dormentes criados automaticamente!`
      );
    }

    if (stats.orphanPayments > 0) {
      console.log(
        `⚠️ ${stats.orphanPayments} APs ficaram órfãs (usuários não validados no Oracle)`
      );
    }

    if (stats.created === stats.total && stats.errors === 0) {
      console.log(
        '🎉 PERFEITO! Todos os registros foram sincronizados com sucesso!'
      );
    }
  }

  /**
   * ✨ NOVA FUNCIONALIDADE: Estatísticas detalhadas
   */
  async getSyncStatistics(): Promise<{
    payments: {
      total: number;
      scheduled: number;
      pending: number;
      orphan: number;
      fromOracle: number;
    };
    users: {
      total: number;
      active: number;
      dormant: number;
      fromOracle: number;
    };
  }> {
    const [
      totalPayments,
      scheduledPayments,
      pendingPayments,
      orphanPayments,
      oraclePayments,
    ] = await Promise.all([
      this.paymentRepo.count(),
      this.paymentRepo.count({ where: { status: PaymentStatus.SCHEDULED } }),
      this.paymentRepo.count({ where: { status: PaymentStatus.PENDING } }),
      this.paymentRepo.count({ where: { requesterId: IsNull() } }),
      this.paymentRepo.count({ where: { erpPaymentId: Not(IsNull()) } }),
    ]);

    const userStats = await this.userSyncService.getUserStats();

    return {
      payments: {
        total: totalPayments,
        scheduled: scheduledPayments,
        pending: pendingPayments,
        orphan: orphanPayments,
        fromOracle: oraclePayments,
      },
      users: userStats,
    };
  }
}
