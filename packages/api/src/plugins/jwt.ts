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
