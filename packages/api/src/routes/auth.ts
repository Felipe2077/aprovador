import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserRole } from 'shared-types';
import { User } from '../entities/postgresql/User.entity';
import { comparePassword } from '../lib/hash';
import { pgDataSource } from '../lib/typeorm';

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

      const userRepo = pgDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { username },
      });

      if (!user || !(await comparePassword(password, user.passwordHash))) {
        return reply.code(401).send({ message: 'Invalid credentials' });
      }

      const accessToken = await reply.jwtSign(
        {
          sub: user.id,
          role: user.role as UserRole,
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

      const userRepo = pgDataSource.getRepository(User);
      const userProfile = await userRepo.findOne({
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
}
