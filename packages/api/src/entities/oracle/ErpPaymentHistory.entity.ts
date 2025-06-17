import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ErpPayment } from './ErpPayment.entity';

@Entity('CPGDOCTO_HISTORICO_NEGOCIACOES', { schema: 'GLOBUS' })
export class ErpPaymentHistory {
  @PrimaryColumn({ name: 'CODDOCTOCPG' })
  erp_payment_id: number;

  @PrimaryColumn({ name: 'SEQUENCIA_EVENTO' })
  sequence_number: number;

  @Column({ name: 'DATA_EVENTO' })
  event_date: Date;

  @Column({ name: 'USUARIO', length: 15 })
  action_user: string;

  @Column({ name: 'VLR_BRUTO', type: 'decimal', precision: 22, scale: 2 })
  amount_at_time: number;

  @Column({ name: 'MAIS_INFORMACOES', length: 500 })
  comment: string;

  @ManyToOne(() => ErpPayment, (payment) => payment.history)
  @JoinColumn({ name: 'CODDOCTOCPG' })
  payment: ErpPayment;
}
