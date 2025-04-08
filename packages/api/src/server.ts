import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import authPlugin from './plugins/auth';
import corsPlugin from './plugins/cors';
import envPlugin from './plugins/env';
import helmetPlugin from './plugins/helmet';
import jwtPlugin from './plugins/jwt';
import swaggerPlugin from './plugins/swagger';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';

const server = fastify({
  logger: { level: 'info', transport: { target: 'pino-pretty' } },
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
  // Plugins essenciais
  await server.register(envPlugin);
  await server.register(corsPlugin);
  await server.register(helmetPlugin);
  await server.register(jwtPlugin);
  await server.register(authPlugin);

  // Plugin de Documentação Swagger
  await server.register(swaggerPlugin); // <--- Registra

  // Rotas da Aplicação
  await server.register(healthRoutes);
  await server.register(authRoutes, { prefix: '/auth' });

  try {
    await server.listen({ port: server.config.PORT, host: server.config.HOST });
    console.log(
      `Server running at http://${server.config.HOST}:${server.config.PORT}`
    );
  } catch (err) {}
}
main();
