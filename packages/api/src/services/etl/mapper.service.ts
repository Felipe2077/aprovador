import { PaymentStatus } from 'shared-types';

export interface OraclePaymentData {
  CODDOCTOCPG: number;
  USUARIO: string;
  DATA_INCLUSAO: Date;
  FAVORECIDODOCTOCPG: string;
  STATUSDOCTOCPG: string;
  QUITADODOCTOCPG: string;
  PAGAMENTOLIBERADO: string;
  VENCIMENTOCPG?: Date;
  NRODOCTOCPG?: string;
  VLR_BRUTO?: number;
  NFANTASIAFORN?: string;
  NOMEUSUARIO?: string;
}

export class PaymentMapperService {
  // ✅ Mapear status Oracle → Status interno
  static mapOracleStatus(
    statusDocto: string,
    quitado: string,
    liberado: string
  ): PaymentStatus {
    // Lógica baseada na documentação do schema Oracle
    if (statusDocto === 'B' && quitado === 'S') return PaymentStatus.APPROVED; // Bloqueado + Quitado = Pago
    if (statusDocto === 'B' && liberado === 'S') return PaymentStatus.APPROVED; // Bloqueado + Liberado = Aprovado
    if (statusDocto === 'B') return PaymentStatus.PENDING; // Bloqueado = Pendente
    if (statusDocto === 'C') return PaymentStatus.CANCELLED; // Cancelado
    if (statusDocto === 'N') return PaymentStatus.PENDING; // Novo = Pendente

    return PaymentStatus.PENDING; // Default
  }

  // ✅ Mapear dados Oracle → Payment entity
  static mapOracleToPayment(oracleData: OraclePaymentData) {
    return {
      erpPaymentId: oracleData.CODDOCTOCPG,
      amount: oracleData.VLR_BRUTO || 0,
      currency: 'BRL', // Assumindo BRL por padrão
      payee: oracleData.FAVORECIDODOCTOCPG || 'Favorecido não informado',
      description: `AP ${oracleData.NRODOCTOCPG || oracleData.CODDOCTOCPG} - ${
        oracleData.NFANTASIAFORN || 'Fornecedor'
      }`,
      status: this.mapOracleStatus(
        oracleData.STATUSDOCTOCPG,
        oracleData.QUITADODOCTOCPG,
        oracleData.PAGAMENTOLIBERADO
      ),
      dueDate: oracleData.VENCIMENTOCPG,

      // Metadados para rastreamento
      erpData: {
        originalStatus: oracleData.STATUSDOCTOCPG,
        quitado: oracleData.QUITADODOCTOCPG,
        liberado: oracleData.PAGAMENTOLIBERADO,
        documentNumber: oracleData.NRODOCTOCPG,
        supplierName: oracleData.NFANTASIAFORN,
        requesterName: oracleData.NOMEUSUARIO,
        syncDate: new Date(),
      },
    };
  }

  // ✅ Mapear username Oracle → User ID PostgreSQL
  static async mapOracleUserToUserId(
    oracleUsername: string,
    userRepo: any
  ): Promise<string | null> {
    try {
      // Buscar user por username no PostgreSQL
      const user = await userRepo.findOne({
        where: { username: oracleUsername },
      });

      return user?.id || null;
    } catch (error) {
      console.warn(`Erro ao mapear usuário ${oracleUsername}:`, error);
      return null;
    }
  }
}
