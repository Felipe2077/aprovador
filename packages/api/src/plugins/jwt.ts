// packages/api/src/plugins/jwt.ts
import fastifyJwt from '@fastify/jwt';
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

  server.log.info('JWT plugin registered');

  // (Opcional, mas útil) Adiciona um decorator para facilitar a verificação em rotas
  // server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  //   try {
  //     await request.jwtVerify();
  //   } catch (err) {
  //     reply.send(err); // Ou um erro mais apropriado
  //   }
  // });
  // Faremos a verificação com @fastify/auth ou hook depois, mais flexível
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
