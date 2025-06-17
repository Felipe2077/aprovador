import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import 'reflect-metadata';
import { closeDataSources, initializeDataSources } from './config/datasources';
import authPlugin from './plugins/auth';
import corsPlugin from './plugins/cors';
import envPlugin from './plugins/env';
import helmetPlugin from './plugins/helmet';
import jwtPlugin from './plugins/jwt';
import swaggerPlugin from './plugins/swagger';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import oracleTestRoutes from './routes/oracle-test';
import paymentsRoutes from './routes/payments';
import syncRoutes from './routes/sync';

const server = fastify({
  logger: { level: 'info', transport: { target: 'pino-pretty' } },
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
  // Inicializar DataSources
  await initializeDataSources();

  // Plugins
  await server.register(envPlugin);
  await server.register(corsPlugin);
  await server.register(helmetPlugin);
  await server.register(jwtPlugin);
  await server.register(authPlugin);
  await server.register(swaggerPlugin);

  // Rotas
  await server.register(healthRoutes);
  await server.register(authRoutes, { prefix: '/auth' });
  await server.register(oracleTestRoutes, { prefix: '/test' });
  await server.register(paymentsRoutes, { prefix: '/payments' });
  await server.register(syncRoutes, { prefix: '/sync' });

  // Graceful shutdown
  server.addHook('onClose', async () => {
    await closeDataSources();
  });

  try {
    await server.listen({ port: server.config.PORT, host: server.config.HOST });
    console.log(
      `🚀 Server running at http://${server.config.HOST}:${server.config.PORT}`
    );
  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => await server.close());
process.on('SIGINT', async () => await server.close());

main();
