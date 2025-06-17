// packages/api/src/entities/postgresql/User.entity.ts - VERSÃO HÍBRIDA
import { UserActivationStatus, UserRole } from 'shared-types';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from './Attachment.entity';
import { Payment } from './Payment.entity';
import { PaymentComment } from './PaymentComment.entity';

/**
 * Entidade User - Sistema Híbrido Oracle ↔ Aplicativo
 *
 * Suporta dois tipos de usuários:
 * 1. DORMANT: Criados automaticamente do Oracle, precisam ativar conta
 * 2. ACTIVE: Usuários que já ativaram e podem usar o sistema
 *
 * Regras:
 * - Username sempre MAIÚSCULO
 * - Validação obrigatória contra Oracle CTR_CADASTRODEUSUARIOS
 * - passwordHash pode ser null (usuários dormentes)
 */

@Entity('users')
@Index(['username'], { unique: true })
@Index(['erpUserId'], { unique: true, where: 'erp_user_id IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true,
    transformer: {
      to: (value: string) => value?.toUpperCase(),
      from: (value: string) => value,
    },
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Hash da senha - null para usuários dormentes',
  })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.REQUESTER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserActivationStatus,
    default: UserActivationStatus.DORMANT,
    comment: 'Status de ativação do usuário',
  })
  activationStatus: UserActivationStatus;

  // 🆕 Campos para integração Oracle
  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
    name: 'erp_user_id',
    comment: 'ID do usuário no Oracle (USUARIO do CTR_CADASTRODEUSUARIOS)',
  })
  erpUserId: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Email do usuário no Oracle',
  })
  erpEmail: string | null;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Se o usuário está ativo no Oracle (ATIVO = S)',
  })
  erpActive: boolean;

  // 🆕 Campos de controle de ativação
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Quando o usuário ativou a conta pela primeira vez',
  })
  activatedAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Última sincronização com dados do Oracle',
  })
  lastSyncAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => Payment, (payment) => payment.requester)
  paymentsRequested: Payment[];

  @OneToMany(() => Payment, (payment) => payment.approver)
  paymentsApproved: Payment[];

  @OneToMany(() => Payment, (payment) => payment.canceller)
  paymentsCancelled: Payment[];

  @OneToMany(() => PaymentComment, (comment) => comment.user)
  comments: PaymentComment[];

  @OneToMany(() => Attachment, (attachment) => attachment.uploadedBy)
  attachments: Attachment[];

  // 🆕 Hooks para garantir username sempre maiúsculo
  @BeforeInsert()
  @BeforeUpdate()
  normalizeUsername() {
    if (this.username) {
      this.username = this.username.toUpperCase().trim();
    }
    if (this.erpUserId) {
      this.erpUserId = this.erpUserId.toUpperCase().trim();
    }
  }

  // 🆕 Métodos auxiliares

  /**
   * Verifica se o usuário está ativo e pode usar o sistema
   */
  isActive(): boolean {
    return this.activationStatus === UserActivationStatus.ACTIVE;
  }

  /**
   * Verifica se o usuário é "dormante" (criado do Oracle, não ativado)
   */
  isDormant(): boolean {
    return this.activationStatus === UserActivationStatus.DORMANT;
  }

  /**
   * Verifica se o usuário foi criado a partir do Oracle
   */
  isFromOracle(): boolean {
    return this.erpUserId !== null;
  }

  /**
   * Verifica se o usuário pode fazer login
   */
  canLogin(): boolean {
    return this.isActive() && this.passwordHash !== null;
  }

  /**
   * Ativa a conta do usuário (primeira vez)
   */
  activateAccount(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.activationStatus = UserActivationStatus.ACTIVE;
    this.activatedAt = new Date();
  }

  /**
   * Dados para resposta da API (sem senha)
   */
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      role: this.role,
      activationStatus: this.activationStatus,
      isFromOracle: this.isFromOracle(),
      canLogin: this.canLogin(),
      activatedAt: this.activatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
