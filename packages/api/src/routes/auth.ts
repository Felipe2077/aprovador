// packages/api/src/routes/auth.ts
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { comparePassword } from '../lib/hash';
import { prisma } from '../lib/prisma';
import { UserRole } from 'shared-types';

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
          role: user.role as UserRole, // Diz ao TS: "Trate o user.role do Prisma como o UserRole de shared-types"

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
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      const userId = request.user.sub;

      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userProfile) {
        return reply.code(404).send({ message: 'User not found' });
      }

      return userProfile;
    }
  );

  //TODO Aqui adicionaremos GET /users/me depois
}
