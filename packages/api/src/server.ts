// packages/api/src/server.ts (Início e Função main)
import fastify from 'fastify';
import envPlugin from './plugins/env'; // Importa
// ... outros imports (cors, helmet, health) virão ...
import healthRoutes from './routes/health';

const server = fastify({
  logger: { level: 'info', transport: { target: 'pino-pretty' } },
});

async function main() {
  // Registra ENV primeiro
  await server.register(envPlugin);
  // ... registrar outros plugins aqui depois ...
  await server.register(healthRoutes);

  try {
    // Usa as configs carregadas
    await server.listen({ port: server.config.PORT, host: server.config.HOST });
    console.log(
      `Server running at http://${server.config.HOST}:${server.config.PORT}`
    );
  } catch (err) {}
}
main();
