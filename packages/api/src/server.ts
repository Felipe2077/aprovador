// packages/api/src/server.ts - VERSÃO ATUALIZADA COM JOBS
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import 'reflect-metadata';
import { closeDataSources, initializeDataSources } from './config/datasources';
import { scheduler } from './jobs/scheduler';
import authPlugin from './plugins/auth';
import corsPlugin from './plugins/cors';
import envPlugin from './plugins/env';
import helmetPlugin from './plugins/helmet';
import jwtPlugin from './plugins/jwt';
import swaggerPlugin from './plugins/swagger';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import jobsRoutes from './routes/jobs';
import oracleTestRoutes from './routes/oracle-test';
import paymentsRoutes from './routes/payments';
import syncRoutes from './routes/sync';

const server = fastify({
  logger: { level: 'info', transport: { target: 'pino-pretty' } },
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
  try {
    // ✅ 1. Inicializar DataSources
    console.log('🔌 Inicializando conexões de banco...');
    await initializeDataSources();

    // ✅ 2. Registrar plugins
    console.log('🔧 Registrando plugins...');
    await server.register(envPlugin);
    await server.register(corsPlugin);
    await server.register(helmetPlugin);
    await server.register(jwtPlugin);
    await server.register(authPlugin);
    await server.register(swaggerPlugin);

    // ✅ 3. Registrar rotas
    console.log('🛣️ Registrando rotas...');
    await server.register(healthRoutes);
    await server.register(authRoutes, { prefix: '/auth' });
    await server.register(oracleTestRoutes, { prefix: '/test' });
    await server.register(paymentsRoutes, { prefix: '/payments' });
    await server.register(syncRoutes, { prefix: '/sync' });
    await server.register(jobsRoutes, { prefix: '/jobs' }); // 🆕 NOVA ROTA

    // ✅ 4. Inicializar sistema de jobs
    console.log('⚙️ Inicializando sistema de jobs...');
    scheduler.start();

    // ✅ 5. Configurar graceful shutdown
    server.addHook('onClose', async () => {
      console.log('🛑 Iniciando graceful shutdown...');

      // Parar scheduler primeiro
      scheduler.stop();

      // Fechar conexões de banco
      await closeDataSources();

      console.log('✅ Graceful shutdown concluído');
    });

    // ✅ 6. Iniciar servidor
    await server.listen({
      port: server.config.PORT,
      host: server.config.HOST,
    });

    console.log('🎉 ==========================================');
    console.log(`🚀 Servidor iniciado com sucesso!`);
    console.log(`📍 URL: http://${server.config.HOST}:${server.config.PORT}`);
    console.log(
      `📚 Docs: http://${server.config.HOST}:${server.config.PORT}/docs`
    );
    console.log(`⚙️ Jobs: Sistema automatizado ativo`);
    console.log('🎉 ==========================================');
  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

// ✅ Handlers de shutdown
process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM recebido, iniciando shutdown...');
  await server.close();
});

process.on('SIGINT', async () => {
  console.log('📡 SIGINT recebido, iniciando shutdown...');
  await server.close();
});

// ✅ Handler de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Não fazer exit imediato, deixar graceful shutdown funcionar
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ✅ Iniciar aplicação
main();

// ===================================================================
// 🔧 INSTRUÇÕES PARA ATUALIZAR O ARQUIVO ORIGINAL:
// ===================================================================
//
// 1. Substitua o conteúdo do packages/api/src/server.ts pelo código acima
// 2. Adicione a nova rota de jobs: await server.register(jobsRoutes, { prefix: '/jobs' });
// 3. Adicione o import: import jobsRoutes from './routes/jobs';
// 4. Adicione o import: import { scheduler } from './jobs/scheduler';
// 5. Adicione scheduler.start() após registrar as rotas
// 6. Adicione scheduler.stop() no graceful shutdown
//
// ===================================================================
