import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('CTR_CADASTRODEUSUARIOS', { schema: 'GLOBUS' })
export class ErpUser {
  @PrimaryColumn({ name: 'USUARIO', length: 15 })
  username: string;

  @Column({ name: 'NOMEUSUARIO', length: 40 })
  name: string;

  @Column({ name: 'EMAIL', length: 50 })
  email: string;

  @Column({ name: 'ATIVO', length: 1 })
  is_active: string;
}
