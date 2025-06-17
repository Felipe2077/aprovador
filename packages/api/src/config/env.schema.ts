export const envSchema = {
  type: 'object',
  required: [
    'PORT',
    'HOST',
    'JWT_SECRET',
    // ✅ REMOVER: DATABASE_URL e ORACLE_CONNECT_STRING (não existem no .env)
    // Usar as variáveis que realmente existem
    'ORACLE_USER',
    'ORACLE_PASSWORD',
    'ORACLE_SERVICE_NAME',
  ],
  properties: {
    PORT: { type: 'number', default: 3333 },
    HOST: { type: 'string', default: '0.0.0.0' },
    JWT_SECRET: { type: 'string' },
    JWT_EXPIRES_IN: { type: 'string', default: '15m' },

    // ✅ PostgreSQL - usando variáveis que existem
    POSTGRES_HOST: { type: 'string', default: 'localhost' },
    POSTGRES_PORT: { type: 'number', default: 5432 },
    POSTGRES_USER: { type: 'string', default: 'docker' },
    POSTGRES_PASSWORD: { type: 'string', default: 'docker' },
    POSTGRES_DB: { type: 'string', default: 'aprovador_db' },

    // ✅ Oracle - usando variáveis que existem
    ORACLE_HOST: { type: 'string' },
    ORACLE_PORT: { type: 'number', default: 1521 },
    ORACLE_USER: { type: 'string' },
    ORACLE_PASSWORD: { type: 'string' },
    ORACLE_SERVICE_NAME: { type: 'string' },

    // ✅ Ambiente
    NODE_ENV: { type: 'string', default: 'development' },
  },
};
