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

      // TODO: Gerar e lidar com Refresh Token aqui em uma etapa futura

      return { accessToken };
    }
  );

  //TODO Aqui adicionaremos GET /users/me depois
}
