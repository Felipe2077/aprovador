// packages/api/src/routes/auth.ts
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { comparePassword } from '../lib/hash';
import { prisma } from '../lib/prisma';

const LoginBodySchema = Type.Object({
  username: Type.String(),
  password: Type.String(),
});
type LoginBody = Static<typeof LoginBodySchema>;

export default async function authRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  server.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        body: LoginBodySchema,
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user || !(await comparePassword(password, user.passwordHash))) {
        return reply.code(401).send({ message: 'Invalid credentials' });
      }

      const accessToken = await reply.jwtSign(
        {
          sub: user.id,
          role: user.role,
          name: user.name,
        },
        {
          expiresIn: server.config.JWT_EXPIRES_IN,
        }
      );

      return { accessToken };
    }
  );

  server.get(
    '/me',
    {
      // Aplica a proteção! Executa server.authenticate ANTES do handler.
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      // Se chegou aqui, o token é válido e request.user está populado.
      // Acessamos o ID do usuário pelo 'sub' (subject) do token JWT.
      const userId = request.user.sub;

      // Busca os dados do usuário no banco (exceto a senha!)
      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          // Seleciona apenas os campos seguros/necessários
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userProfile) {
        // Isso não deveria acontecer se o token é válido, mas por segurança:
        return reply.code(404).send({ message: 'User not found' });
      }

      return userProfile; // Retorna os dados do perfil
    }
  );

  //TODO Aqui adicionaremos GET /users/me depois
}
