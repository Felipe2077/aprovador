// packages/api/src/types/fastify.d.ts
import { FastifyJWT } from '@fastify/jwt';
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    jwt: FastifyJWT;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    verifyDirector(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    verifyRequester(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void>;
  }

  interface FastifyRequest {
    user?: FastifyJWT['user'];
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: string; name?: string };
    user: { sub: string; role: string; name?: string };
  }
}
