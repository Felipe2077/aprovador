import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ErpPayment } from './ErpPayment.entity';

@Entity('BGM_FORNECEDOR', { schema: 'GLOBUS' })
export class ErpSupplier {
  @PrimaryColumn({ name: 'CODIGOFORN' })
  supplier_id: number;

  @Column({ name: 'NFANTASIAFORN', length: 100 })
  supplier_name: string;

  @Column({ name: 'SITUACAO', length: 1 })
  status: string;

  @OneToMany(() => ErpPayment, (payment) => payment.supplier)
  payments: ErpPayment[];
}
