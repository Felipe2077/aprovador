import { UserRole } from 'shared-types';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from './Payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // ✅ Usar ! para indicar que será inicializado pelo TypeORM

  @Column({ unique: true, length: 15 })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.REQUESTER,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Payment, (payment) => payment.requester)
  paymentsRequested!: Payment[];

  @OneToMany(() => Payment, (payment) => payment.approver)
  paymentsApproved!: Payment[];

  @OneToMany(() => Payment, (payment) => payment.canceller)
  paymentsCancelled!: Payment[];
}
