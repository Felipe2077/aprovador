import fastify from 'fastify';

const server = fastify({
  logger: true, // Habilita logs detalhados
});

// Rota de teste /ping
server.get('/ping', async (_request, _reply) => {
  return { pong: 'it works! API is live!' }; //
});

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
