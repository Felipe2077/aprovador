// packages/api/src/plugins/cors.ts
import fastifyCors from '@fastify/cors';
import fp from 'fastify-plugin';
export default fp(async (server) => {
  await server.register(fastifyCors, {
    origin: '*' /* TODO: Restringir em prod */,
  });
  server.log.info('CORS plugin registered');
});
