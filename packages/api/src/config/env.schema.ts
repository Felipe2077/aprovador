// packages/api/src/config/env.schema.ts
export const envSchema = {
  type: 'object',
  required: ['PORT', 'HOST'],
  properties: {
    PORT: { type: 'number', default: 3333 },
    HOST: { type: 'string', default: '0.0.0.0' },
  },
};
