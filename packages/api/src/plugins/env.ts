import fastifyEnv, { FastifyEnvOptions } from '@fastify/env';
import fp from 'fastify-plugin';
import { envSchema } from '../config/env.schema';

export default fp(async (server) => {
  const options: FastifyEnvOptions = {
    confKey: 'config',
    schema: envSchema,
    dotenv: true,
  };
  await server.register(fastifyEnv, options);
  server.log.info('Environment variables plugin registered');
});

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      HOST: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;

      // ✅ PostgreSQL
      POSTGRES_HOST: string;
      POSTGRES_PORT: number;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;

      // ✅ Oracle
      ORACLE_HOST: string;
      ORACLE_PORT: number;
      ORACLE_USER: string;
      ORACLE_PASSWORD: string;
      ORACLE_SERVICE_NAME: string;

      NODE_ENV: string;
    };
  }
}
