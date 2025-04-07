// packages/api/src/plugins/env.ts
import fastifyEnv, { FastifyEnvOptions } from '@fastify/env';
import fp from 'fastify-plugin';
import { envSchema } from '../config/env.schema';

export default fp(async (server) => {
  const options: FastifyEnvOptions = {
    confKey: 'config',
    schema: envSchema,
    dotenv: true,
  };
  await server.register(fastifyEnv, options); // Use await aqui
  server.log.info('Environment variables plugin registered');
});

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      HOST: string;
      DATABASE_URL: string; // <-- Está aqui?
      JWT_SECRET: string; // <-- Está aqui?
      JWT_EXPIRES_IN: string; // <-- Está aqui?
      /* + Futuros */
    };
  }
}
