import fastifyHelmet from '@fastify/helmet';
import fp from 'fastify-plugin';
export default fp(async (server) => {
  await server.register(fastifyHelmet, { contentSecurityPolicy: false });
  server.log.info('Helmet plugin registered');
});
