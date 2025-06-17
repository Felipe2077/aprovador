import * as dotenv from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Entidades PostgreSQL
import { Attachment } from '../entities/postgresql/Attachment.entity';
import { Payment } from '../entities/postgresql/Payment.entity';
import { PaymentComment } from '../entities/postgresql/PaymentComment.entity';
import { User } from '../entities/postgresql/User.entity';

// Entidades Oracle
import { ErpPayment } from '../entities/oracle/ErpPayment.entity';
import { ErpPaymentHistory } from '../entities/oracle/ErpPaymentHistory.entity';
import { ErpSupplier } from '../entities/oracle/ErpSupplier.entity';
import { ErpUser } from '../entities/oracle/ErpUser.entity';

const oracledb = require('oracledb');

try {
  // Tentar diferentes caminhos do Instant Client
  const possiblePaths = [
    '/usr/local/lib/instantclient_21_1',
    '/usr/local/lib/instantclient_19_1',
    '/opt/oracle/instantclient_21_1',
  ];

  let clientInitialized = false;

  for (const libDir of possiblePaths) {
    try {
      oracledb.initOracleClient({ libDir });
      console.log(`✅ Oracle thick mode ativado com: ${libDir}`);
      clientInitialized = true;
      break;
    } catch (err) {
      continue; // Tenta próximo path
    }
  }

  if (!clientInitialized) {
    // Tenta sem especificar libDir (se estiver no PATH)
    oracledb.initOracleClient();
    console.log('✅ Oracle thick mode ativado (auto-detect)');
  }
} catch (err) {
  console.log('⚠️ Oracle thick mode falhou:');
}

// Carregar .env
console.log('[datasources.ts] Script iniciado.');
const envPath = path.resolve(__dirname, '../../.env');
console.log(`[datasources.ts] Carregando .env de: ${envPath}`);
const configResult = dotenv.config({ path: envPath });

if (configResult.error) {
  console.error(
    `[datasources.ts] ERRO ao carregar ${envPath}:`,
    configResult.error
  );
} else {
  console.log('[datasources.ts] .env carregado com sucesso.');
}

// ✅ Validar variáveis Oracle obrigatórias
if (!process.env.ORACLE_SERVICE_NAME) {
  throw new Error('ORACLE_SERVICE_NAME não está configurada no .env');
}

// Configuração PostgreSQL
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'docker',
  password: process.env.POSTGRES_PASSWORD || 'docker',
  database: process.env.POSTGRES_DB || 'aprovador_db',
};

console.log('[datasources.ts] Configuração do PostgreSQL:', {
  ...dbConfig,
  password: '***',
});

// Configuração Oracle
const oracleConfig = {
  host: process.env.ORACLE_HOST || '10.0.1.191',
  port: parseInt(process.env.ORACLE_PORT || '1521', 10),
  username: process.env.ORACLE_USER || 'glbconsult',
  password: process.env.ORACLE_PASSWORD || 'GlbTI3o38$#',
  serviceName: process.env.ORACLE_SERVICE_NAME, // ✅ Garantido que não é undefined
};

console.log('[datasources.ts] Configuração do Oracle:', {
  ...oracleConfig,
  password: '***',
});

// PostgreSQL DataSource
export const PostgreSQLDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: process.env.NODE_ENV === 'development', // ✅ TRUE para criar novas tabelas
  logging:
    process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  entities: [User, Payment, PaymentComment, Attachment],
  migrations: ['src/migrations/postgresql/*.ts'],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

// ✅ Oracle DataSource - com type assertion
export const OracleDataSource = new DataSource({
  type: 'oracle',
  host: oracleConfig.host,
  port: oracleConfig.port,
  username: oracleConfig.username,
  password: oracleConfig.password,
  serviceName: oracleConfig.serviceName as string, // ✅ Type assertion
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error'] : false,
  entities: [ErpPayment, ErpPaymentHistory, ErpSupplier, ErpUser],
});

export async function initializeDataSources() {
  console.log('[datasources.ts] Inicializando conexões...');

  try {
    // PostgreSQL
    if (!PostgreSQLDataSource.isInitialized) {
      await PostgreSQLDataSource.initialize();
      console.log('✅ PostgreSQL conectado com sucesso');

      if (process.env.NODE_ENV === 'development') {
        const tables = await PostgreSQLDataSource.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        console.log(
          '📋 Tabelas no banco:',
          tables.map((t: any) => t.table_name)
        );
      }
    }

    // Oracle
    try {
      if (!OracleDataSource.isInitialized) {
        await OracleDataSource.initialize();
        console.log('✅ Oracle conectado com sucesso');

        // Teste Oracle
        const result = await OracleDataSource.query(
          'SELECT COUNT(*) as total FROM GLOBUS.CPGDOCTO WHERE ROWNUM <= 1'
        );
        console.log('🗄️ Oracle teste:', result[0]);
      }
    } catch (error: any) {
      console.warn(
        '⚠️ Oracle não conectado:',
        error?.message || 'Erro desconhecido'
      );
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao inicializar conexões:', error?.message || error);
    throw error;
  }
}

export async function closeDataSources(): Promise<void> {
  if (PostgreSQLDataSource.isInitialized) await PostgreSQLDataSource.destroy();
  if (OracleDataSource.isInitialized) await OracleDataSource.destroy();
}
