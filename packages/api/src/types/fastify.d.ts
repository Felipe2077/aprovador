import { FastifyJWT } from '@fastify/jwt'; // Importe tipos do @fastify/jwt
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    jwt: FastifyJWT; // Provido por @fastify/jwt
    // Declara nosso decorator personalizado para estar disponível globalmente
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }

  interface FastifyRequest {
    // Adiciona 'user' ao objeto de requisição, usando o tipo definido abaixo
    user?: FastifyJWT['user'];
  }
}

declare module '@fastify/jwt' {
  // Define a estrutura esperada do NOSSO payload JWT e do objeto 'user'
  interface FastifyJWT {
    payload: {
      sub: string; // id do usuário
      role: string; // papel
      name?: string; // nome
      // Adicione outros campos do payload aqui
    };
    user: {
      // Estrutura que vai para request.user
      sub: string;
      role: string;
      name?: string;
      // Adicione outros campos do payload aqui
    };
  }
}
