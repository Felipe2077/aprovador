import { Payment } from '../../entities/postgresql/Payment.entity';
import { User } from '../../entities/postgresql/User.entity';
import { oracleDataSource, pgDataSource } from '../../lib/typeorm';
import { OraclePaymentData, PaymentMapperService } from './mapper.service';

export class SyncService {
  private paymentRepo = pgDataSource.getRepository(Payment);
  private userRepo = pgDataSource.getRepository(User);

  // ✅ Buscar APs novas/atualizadas do Oracle
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
        WHERE c.DATA_INCLUSAO >= SYSDATE - :days
        ORDER BY c.DATA_INCLUSAO DESC
      `;

      const results = await oracleDataSource.query(query, [sinceDays]);
      console.log(`✅ Encontradas ${results.length} APs no Oracle`);

      return results;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do Oracle:', error);
      throw error;
    }
  }

  // ✅ Verificar se AP já existe no PostgreSQL
  async paymentExists(erpPaymentId: number): Promise<Payment | null> {
    try {
      return await this.paymentRepo.findOne({
        where: { erpPaymentId },
      });
    } catch (error) {
      console.error(`Erro ao verificar payment ${erpPaymentId}:`, error);
      return null;
    }
  }

  // ✅ Criar novo payment no PostgreSQL (CORRIGIDO)
  async createPaymentFromOracle(
    oracleData: OraclePaymentData
  ): Promise<Payment | null> {
    try {
      const mappedData = PaymentMapperService.mapOracleToPayment(oracleData);

      // Buscar requester no PostgreSQL
      const requesterId = await PaymentMapperService.mapOracleUserToUserId(
        oracleData.USUARIO,
        this.userRepo
      );

      if (!requesterId) {
        console.warn(
          `⚠️ Usuário ${oracleData.USUARIO} não encontrado no PostgreSQL`
        );
        return null;
      }

      const payment = new Payment();
      payment.erpPaymentId = mappedData.erpPaymentId;
      payment.amount = mappedData.amount;
      payment.currency = mappedData.currency;
      payment.payee = mappedData.payee;
      payment.description = mappedData.description;
      payment.status = mappedData.status;
      payment.requesterId = requesterId;

      // ✅ FIX: Verificar se dueDate existe antes de atribuir
      if (mappedData.dueDate !== undefined) {
        payment.dueDate = mappedData.dueDate;
      }

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

  // ✅ Atualizar payment existente (CORRIGIDO)
  async updatePaymentFromOracle(
    existingPayment: Payment,
    oracleData: OraclePaymentData
  ): Promise<Payment | null> {
    try {
      const mappedData = PaymentMapperService.mapOracleToPayment(oracleData);

      // Atualizar apenas campos que podem ter mudado
      existingPayment.amount = mappedData.amount;
      existingPayment.status = mappedData.status;

      // ✅ FIX: Verificar se dueDate existe antes de atribuir
      if (mappedData.dueDate !== undefined) {
        existingPayment.dueDate = mappedData.dueDate;
      }

      const updatedPayment = await this.paymentRepo.save(existingPayment);
      console.log(
        `📝 Payment ${updatedPayment.id} atualizado (ERP: ${oracleData.CODDOCTOCPG})`
      );

      return updatedPayment;
    } catch (error) {
      console.error(
        `❌ Erro ao atualizar payment para ERP ${oracleData.CODDOCTOCPG}:`,
        error
      );
      return null;
    }
  }

  // ✅ Processo principal de sincronização
  async syncPayments(sinceDays: number = 7): Promise<{
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  }> {
    const stats = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      console.log('🔄 Iniciando sincronização Oracle → PostgreSQL...');

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
            } else {
              stats.errors++;
            }
          } else {
            // Criar novo
            const created = await this.createPaymentFromOracle(oraclePayment);
            if (created) {
              stats.created++;
            } else {
              stats.skipped++;
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

      console.log('✅ Sincronização concluída:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }
}
