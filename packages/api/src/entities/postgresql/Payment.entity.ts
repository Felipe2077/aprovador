import { PaymentStatus } from 'shared-types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from './Attachment.entity';
import { PaymentComment } from './PaymentComment.entity';
import { User } from './User.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Dados financeiros
  @Column('decimal', { precision: 15, scale: 2 })
  amount!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column()
  payee!: string;

  @Column({ nullable: true })
  description?: string;

  // Status e fluxo
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  // ✅ ADICIONAR: Campos para fluxo de aprovação
  @Column({ type: 'jsonb', nullable: true })
  approvalFlow?: {
    approvers: string[]; // Array de user IDs
    currentStep: number;
    isCompleted: boolean;
  };

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  // ✅ ADICIONAR: Referência ao ERP
  @Column({ type: 'bigint', nullable: true })
  erpPaymentId?: number; // Link para GLOBUS.CPGDOCTO

  // Relacionamentos (existentes)
  @Column({ type: 'uuid' })
  requesterId!: string;

  @Column({ type: 'uuid', nullable: true })
  approverId?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  cancellerId?: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relacionamentos
  @ManyToOne(() => User, (user) => user.paymentsRequested)
  @JoinColumn({ name: 'requesterId' })
  requester!: User;

  @ManyToOne(() => User, (user) => user.paymentsApproved)
  @JoinColumn({ name: 'approverId' })
  approver?: User;

  @ManyToOne(() => User, (user) => user.paymentsCancelled)
  @JoinColumn({ name: 'cancellerId' })
  canceller?: User;

  // ✅ NOVOS: Relacionamentos com comentários e anexos
  @OneToMany(() => PaymentComment, (comment) => comment.payment)
  comments!: PaymentComment[];

  @OneToMany(() => Attachment, (attachment) => attachment.payment)
  attachments!: Attachment[];
}
