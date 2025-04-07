export const envSchema = {
  type: 'object',
  required: ['PORT', 'HOST', 'DATABASE_URL', 'JWT_SECRET'],
  properties: {
    PORT: { type: 'number', default: 3333 },
    HOST: { type: 'string', default: '0.0.0.0' },
    DATABASE_URL: { type: 'string' },
    JWT_SECRET: { type: 'string' },
    JWT_EXPIRES_IN: { type: 'string', default: '15m' },
  },
};
