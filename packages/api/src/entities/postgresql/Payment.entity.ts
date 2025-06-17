// packages/api/src/entities/postgresql/Payment.entity.ts - VERSÃO HÍBRIDA
import { PaymentStatus } from 'shared-types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from './Attachment.entity';
import { PaymentComment } from './PaymentComment.entity';
import { User } from './User.entity';

/**
 * Entidade Payment - Sistema Híbrido Oracle ↔ Aplicativo
 *
 * Suporta APs em diferentes estados:
 * 1. SCHEDULED: Sincronizada do Oracle, aguardando definição de fluxo
 * 2. PENDING: Com fluxo definido, seguindo aprovação normal
 * 3. APPROVED/REJECTED/etc: Estados normais do fluxo
 *
 * Campos Oracle sempre preenchidos para rastreabilidade completa.
 */

@Entity('payments')
@Index(['erpPaymentId'], { unique: true, where: 'erp_payment_id IS NOT NULL' })
@Index(['requesterUsername'])
@Index(['status'])
@Index(['dueDate'])
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  currency: string;

  @Column({ type: 'varchar', length: 200 })
  payee: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.SCHEDULED, // 🆕 NOVO: Status padrão para APs do Oracle
  })
  status: PaymentStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'json', nullable: true })
  approvalFlow: any | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  // 🆕 Campos para integração Oracle (sempre preenchidos)
  @Column({
    type: 'bigint',
    nullable: true,
    name: 'erp_payment_id',
    comment: 'ID da AP no Oracle (CODDOCTOCPG)',
  })
  erpPaymentId: number | null;

  @Column({
    type: 'varchar',
    length: 15,
    name: 'requester_username',
    nullable: true, // ✨ PERMITIR NULL temporariamente
    comment: 'Username do solicitante no Oracle (sempre preenchido)',
  })
  requesterUsername: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'requester_name',
    nullable: true, // ✨ PERMITIR NULL temporariamente
    comment: 'Nome do solicitante no Oracle (sempre preenchido)',
  })
  requesterName: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    name: 'erp_document_number',
    comment: 'Número do documento no Oracle (NRODOCTOCPG)',
  })
  erpDocumentNumber: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    name: 'erp_supplier_name',
    comment: 'Nome do fornecedor no Oracle',
  })
  erpSupplierName: string | null;

  @Column({
    type: 'json',
    nullable: true,
    name: 'erp_metadata',
    comment: 'Metadados completos do Oracle para rastreabilidade',
  })
  erpMetadata: any | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_oracle_sync',
    comment: 'Última sincronização com Oracle',
  })
  lastOracleSync: Date | null;

  // Relacionamentos

  // 🆕 MODIFICADO: requesterId agora é opcional (pode ser null para APs órfãs)
  @Column({
    type: 'uuid',
    nullable: true,
    name: 'requester_id',
    comment: 'FK para User - null se usuário ainda não ativou conta',
  })
  requesterId: string | null;

  @ManyToOne(() => User, (user) => user.paymentsRequested, { nullable: true })
  @JoinColumn({ name: 'requester_id' })
  requester: User | null;

  @Column({ type: 'uuid', nullable: true })
  approverId: string | null;

  @ManyToOne(() => User, (user) => user.paymentsApproved, { nullable: true })
  @JoinColumn({ name: 'approverId' })
  approver: User | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  cancellerId: string | null;

  @ManyToOne(() => User, (user) => user.paymentsCancelled, { nullable: true })
  @JoinColumn({ name: 'cancellerId' })
  canceller: User | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos filhos
  @OneToMany(() => PaymentComment, (comment) => comment.payment)
  comments: PaymentComment[];

  @OneToMany(() => Attachment, (attachment) => attachment.payment)
  attachments: Attachment[];

  // 🆕 Métodos auxiliares

  /**
   * Verifica se a AP foi sincronizada do Oracle
   */
  isFromOracle(): boolean {
    return this.erpPaymentId !== null;
  }

  /**
   * Verifica se a AP está órfã (sem usuário local)
   */
  isOrphan(): boolean {
    return this.requesterId === null;
  }

  /**
   * Verifica se a AP está agendada (precisa definir fluxo)
   */
  isScheduled(): boolean {
    return this.status === PaymentStatus.SCHEDULED;
  }

  /**
   * Verifica se a AP pode seguir fluxo de aprovação
   */
  canFollowApprovalFlow(): boolean {
    return this.requesterId !== null && this.status !== PaymentStatus.SCHEDULED;
  }

  /**
   * Adota a AP para um usuário (quando ele ativa a conta)
   */
  adoptByUser(userId: string): void {
    if (this.requesterUsername && this.isOrphan()) {
      this.requesterId = userId;
    }
  }

  /**
   * Define fluxo de aprovação e inicia o processo
   */
  setApprovalFlow(approvalFlow: any): void {
    if (this.isScheduled() && this.requesterId) {
      this.approvalFlow = approvalFlow;
      this.status = PaymentStatus.PENDING;
    }
  }

  /**
   * Dados completos para resposta da API
   */
  toDetailedObject() {
    return {
      id: this.id,
      amount: this.amount,
      currency: this.currency,
      payee: this.payee,
      description: this.description,
      status: this.status,
      dueDate: this.dueDate,
      approvalFlow: this.approvalFlow,
      rejectionReason: this.rejectionReason,

      // Dados Oracle
      erpPaymentId: this.erpPaymentId,
      requesterUsername: this.requesterUsername,
      requesterName: this.requesterName,
      erpDocumentNumber: this.erpDocumentNumber,
      erpSupplierName: this.erpSupplierName,

      // Status de relacionamento
      isFromOracle: this.isFromOracle(),
      isOrphan: this.isOrphan(),
      isScheduled: this.isScheduled(),
      canFollowApprovalFlow: this.canFollowApprovalFlow(),

      // Timestamps
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastOracleSync: this.lastOracleSync,
    };
  }
}
