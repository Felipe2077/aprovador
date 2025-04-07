import fastifyAuth from '@fastify/auth';
import fp from 'fastify-plugin';

export default fp(async (server) => {
  await server.register(fastifyAuth);
  server.log.info('Auth plugin registered');
});
