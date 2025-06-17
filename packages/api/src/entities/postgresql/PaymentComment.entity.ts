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

@Entity('payment_comments')
export class PaymentComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  paymentId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'text' })
  comment!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'COMMENT',
  })
  actionType!: string; // COMMENT, APPROVAL, REJECTION, SUBMISSION, etc.

  @Column({ type: 'boolean', default: false })
  isInternal!: boolean; // true = comentário interno, false = visível para solicitante

  @CreateDateColumn()
  createdAt!: Date;

  // Relacionamentos
  @ManyToOne(() => Payment, (payment) => payment.comments)
  @JoinColumn({ name: 'paymentId' })
  payment!: Payment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
