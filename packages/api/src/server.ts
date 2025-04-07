// packages/api/src/server.ts (Início e Função main)
import fastify from 'fastify';
import corsPlugin from './plugins/cors';
import envPlugin from './plugins/env';
import helmetPlugin from './plugins/helmet';
import jwtPlugin from './plugins/jwt';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';

const server = fastify({
  logger: { level: 'info', transport: { target: 'pino-pretty' } },
});

async function main() {
  await server.register(envPlugin);
  await server.register(healthRoutes);
  await server.register(corsPlugin);
  await server.register(helmetPlugin);
  await server.register(jwtPlugin);

  await server.register(authRoutes, { prefix: '/auth' });

  try {
    // Usa as configs carregadas
    await server.listen({ port: server.config.PORT, host: server.config.HOST });
    console.log(
      `Server running at http://${server.config.HOST}:${server.config.PORT}`
    );
  } catch (err) {}
}
main();
