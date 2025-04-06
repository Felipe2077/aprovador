import fastify from 'fastify';
import healthRoutes from './routes/health';

const server = fastify({
  logger: true, // Habilita logs detalhados
});

server.register(healthRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
