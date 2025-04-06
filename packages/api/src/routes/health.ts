import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function healthRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  server.get('/ping', async (_request, _reply) => {
    return { pong: 'it works! API is live!' };
  });

  //TODO No futuro, poderíamos adicionar um '/health' que verifica DB, etc.
}
