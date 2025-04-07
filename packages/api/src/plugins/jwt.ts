// packages/api/src/plugins/jwt.ts
import fastifyJwt from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (server) => {
  // Registra o plugin JWT
  await server.register(fastifyJwt, {
    // Pega o segredo carregado pelo @fastify/env
    secret: server.config.JWT_SECRET,
    // Podemos adicionar configurações de cookie aqui depois, se usarmos para refresh tokens
    // sign: {
    //   expiresIn: server.config.JWT_EXPIRES_IN, // Pode definir expiração padrão aqui também
    // }
  });

  server.decorate(
    'authenticate',
    async function (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      try {
        await request.jwtVerify();
        server.log.info(
          { user: request.user },
          'User authenticated via decorator'
        );
      } catch (err) {
        server.log.warn({ err }, 'JWT verification failed via decorator');
        await reply.code(401).send({ message: 'Authentication required' });
      }
    }
  );
  server.log.info('Authentication decorator registered');
});

// Adiciona tipos para o Fastify saber sobre .jwt e .sign/.verify
// (Normalmente @fastify/jwt já faz isso, mas pode ser explícito se necessário)
// declare module 'fastify' {
//   interface FastifyInstance { jwt: JWT; }
//   interface FastifyRequest { jwtVerify(): Promise<void>; }
//   interface FastifyReply { jwtSign(payload: any, options?: jwt.SignOptions): Promise<string>; }
// }
// declare module '@fastify/jwt' {
//   interface FastifyJWT { user: { sub: string; role: string; name: string; /* + */ } }
// }
