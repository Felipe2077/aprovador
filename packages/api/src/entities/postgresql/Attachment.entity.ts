import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './Payment.entity';
import { User } from './User.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  paymentId?: string;

  @Column({ type: 'uuid' })
  uploadedById!: string;

  @Column({ length: 255 })
  originalName!: string;

  @Column({ length: 255 })
  fileName!: string; // Nome do arquivo no storage

  @Column({ length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  fileSize!: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'PAYMENT_ATTACHMENT',
  })
  attachmentType!: string; // PAYMENT_ATTACHMENT, PAYMENT_RECEIPT, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Relacionamentos
  @ManyToOne(() => Payment, (payment) => payment.attachments, {
    nullable: true,
  })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy!: User;
}
