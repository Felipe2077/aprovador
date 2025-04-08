// packages/api/src/plugins/auth.ts
import fastifyAuth from '@fastify/auth'; // Importe FastifyAuthFunction
import fp from 'fastify-plugin';
// 1. Importe as funções de verificação de papel
import { verifyDirectorRole, verifyRequesterRole } from '../lib/authUtils';

/**
 * Registra o plugin @fastify/auth e adiciona decorators
 * para verificações de papel comuns.
 */
export default fp(async (server) => {
  // 2. Registra o @fastify/auth (como já estava)
  await server.register(fastifyAuth);

  // 3. Decora a instância do servidor com as funções de verificação
  //    Isso permite usar server.verifyDirector, etc., de forma mais limpa
  server.decorate('verifyDirector', verifyDirectorRole);
  server.decorate('verifyRequester', verifyRequesterRole);
  // Poderíamos adicionar outros decorators de verificação aqui depois

  server.log.info(
    'Auth plugin registered and role verification decorators added'
  );
});

// 4. (IMPORTANTE!) Precisamos atualizar as definições de tipo globais
//    para informar o TypeScript sobre esses novos decorators. Faremos isso no próximo passo.
