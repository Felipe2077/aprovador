// packages/api/src/services/etl/mapper.service.ts - VERSÃO HÍBRIDA
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
  /**
   * ✨ NOVA LÓGICA: Mapear status Oracle → Status interno
   *
   * Todas as APs do Oracle começam como SCHEDULED
   * para que o usuário defina o fluxo de aprovação
   */
  static mapOracleStatus(
    statusDocto: string,
    quitado: string,
    _liberado: string // Prefixo _ indica parâmetro não utilizado
  ): PaymentStatus {
    // 🆕 MUDANÇA: Por ora, sempre SCHEDULED
    // O usuário vai definir o fluxo e mudar para PENDING
    //
    // Futura evolução pode considerar:
    // - Se já está quitado (S) → APPROVED/PAID
    // - Se cancelado (C) → CANCELLED
    // Mas por enquanto, vamos com SCHEDULED para definir fluxo

    if (statusDocto === 'C') {
      return PaymentStatus.CANCELLED; // Cancelado no Oracle
    }

    if (statusDocto === 'B' && quitado === 'S') {
      return PaymentStatus.PAID; // Já foi pago
    }

    // Para todos os outros casos, começa como SCHEDULED
    return PaymentStatus.SCHEDULED;
  }

  /**
   * ✨ NOVA LÓGICA: Mapear dados Oracle → Payment entity
   */
  static mapOracleToPayment(oracleData: OraclePaymentData) {
    // Garantir que temos um valor válido
    const amount =
      oracleData.VLR_BRUTO && oracleData.VLR_BRUTO > 0
        ? oracleData.VLR_BRUTO
        : 0.01; // Valor mínimo para evitar problemas

    // Garantir que temos um payee válido
    const payee =
      oracleData.FAVORECIDODOCTOCPG?.trim() ||
      oracleData.NFANTASIAFORN?.trim() ||
      'Favorecido não informado';

    // Descrição mais informativa
    const description = this.buildDescription(oracleData);

    return {
      erpPaymentId: oracleData.CODDOCTOCPG,
      amount,
      currency: 'BRL', // Assumindo BRL por padrão
      payee,
      description,
      status: this.mapOracleStatus(
        oracleData.STATUSDOCTOCPG,
        oracleData.QUITADODOCTOCPG,
        oracleData.PAGAMENTOLIBERADO
      ),
      dueDate: oracleData.VENCIMENTOCPG,

      // ✨ Dados Oracle sempre preenchidos
      requesterUsername: oracleData.USUARIO.toUpperCase().trim(),
      requesterName: oracleData.NOMEUSUARIO?.trim() || oracleData.USUARIO,
      erpDocumentNumber: oracleData.NRODOCTOCPG?.trim(),
      erpSupplierName: oracleData.NFANTASIAFORN?.trim(),

      // Metadados para rastreabilidade
      erpMetadata: {
        originalStatus: oracleData.STATUSDOCTOCPG,
        quitado: oracleData.QUITADODOCTOCPG,
        liberado: oracleData.PAGAMENTOLIBERADO,
        documentNumber: oracleData.NRODOCTOCPG,
        supplierName: oracleData.NFANTASIAFORN,
        requesterName: oracleData.NOMEUSUARIO,
        syncDate: new Date(),
        dataInclusao: oracleData.DATA_INCLUSAO,
      },
    };
  }

  /**
   * ✨ Constrói descrição informativa da AP
   */
  private static buildDescription(oracleData: OraclePaymentData): string {
    const parts = [];

    // Adicionar número do documento
    if (oracleData.NRODOCTOCPG) {
      parts.push(`Doc: ${oracleData.NRODOCTOCPG}`);
    }

    // Adicionar fornecedor
    if (oracleData.NFANTASIAFORN) {
      parts.push(`Fornecedor: ${oracleData.NFANTASIAFORN}`);
    }

    // Adicionar código ERP
    parts.push(`ERP: ${oracleData.CODDOCTOCPG}`);

    // Se não temos nada específico, usar descrição genérica
    if (parts.length === 1) {
      // Apenas o código ERP
      return `Requisição de Pagamento ${oracleData.CODDOCTOCPG}`;
    }

    return parts.join(' - ');
  }

  /**
   * ✨ Valida se dados Oracle são suficientes para criar Payment
   */
  static validateOracleData(oracleData: OraclePaymentData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!oracleData.CODDOCTOCPG) {
      errors.push('CODDOCTOCPG é obrigatório');
    }

    if (!oracleData.USUARIO?.trim()) {
      errors.push('USUARIO é obrigatório');
    }

    if (!oracleData.STATUSDOCTOCPG?.trim()) {
      errors.push('STATUSDOCTOCPG é obrigatório');
    }

    // Validar valor
    if (oracleData.VLR_BRUTO !== undefined && oracleData.VLR_BRUTO < 0) {
      errors.push('VLR_BRUTO não pode ser negativo');
    }

    // Validar datas
    if (
      oracleData.DATA_INCLUSAO &&
      !(oracleData.DATA_INCLUSAO instanceof Date)
    ) {
      errors.push('DATA_INCLUSAO deve ser uma data válida');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * ✨ Normaliza username para padrão do sistema (MAIÚSCULO)
   */
  static normalizeUsername(username: string): string {
    return username?.toUpperCase().trim() || '';
  }

  /**
   * ✨ Extrai informações resumidas para logs
   */
  static extractLogInfo(oracleData: OraclePaymentData): string {
    const username = this.normalizeUsername(oracleData.USUARIO);
    const docNumber = oracleData.NRODOCTOCPG || 'S/N';
    const value = oracleData.VLR_BRUTO || 0;

    return `${
      oracleData.CODDOCTOCPG
    } (${username}, Doc: ${docNumber}, R$ ${value.toFixed(2)})`;
  }
}
