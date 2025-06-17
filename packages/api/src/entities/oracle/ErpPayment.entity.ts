// ErpPayment.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ErpPaymentHistory } from './ErpPaymentHistory.entity';
import { ErpSupplier } from './ErpSupplier.entity';

@Entity('CPGDOCTO', { schema: 'GLOBUS' })
export class ErpPayment {
  @PrimaryColumn({ name: 'CODDOCTOCPG' })
  erp_payment_id!: number;

  @Column({ name: 'USUARIO', length: 15 })
  requester_username!: string;

  @Column({ name: 'DATA_INCLUSAO' })
  created_date!: Date;

  @Column({ name: 'VENCIMENTOCPG' })
  due_date!: Date;

  @Column({ name: 'STATUSDOCTOCPG', length: 1 })
  erp_status!: string;

  @Column({ name: 'QUITADODOCTOCPG', length: 1 })
  is_paid!: string;

  @Column({ name: 'PAGAMENTOLIBERADO', length: 1 })
  payment_approved!: string;

  @Column({ name: 'NRODOCTOCPG', length: 10 })
  document_number!: string;

  @Column({ name: 'FAVORECIDODOCTOCPG', length: 200 })
  payee_name!: string;

  @Column({ name: 'CODIGOFORN' })
  supplier_id!: number;

  @Column({ name: 'VLR_ORIGINAL', type: 'decimal', precision: 22, scale: 2 })
  original_value!: number;

  @OneToMany(() => ErpPaymentHistory, (history) => history.payment)
  history!: ErpPaymentHistory[];

  @ManyToOne(() => ErpSupplier)
  @JoinColumn({ name: 'CODIGOFORN' })
  supplier!: ErpSupplier;
}
