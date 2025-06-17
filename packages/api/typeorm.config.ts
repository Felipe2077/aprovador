// packages/api/typeorm.config.ts
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/entities/postgresql/*.entity.ts'],
  migrations: ['src/migrations/postgresql/*.ts'],
  synchronize: false,
});
