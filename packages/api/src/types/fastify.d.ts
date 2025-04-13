import { FastifyJWT } from '@fastify/jwt';
import 'fastify';
import { BaseUser, UserRole } from 'shared-types';

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
    user?: BaseUser & { sub: string };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: UserRole;
      name?: string;
    };
    user: {
      sub: string;
      role: UserRole;
      name?: string;
    };
  }
}
