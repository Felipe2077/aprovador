import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PaymentStatus } from 'shared-types';
import { Payment } from '../entities/postgresql/Payment.entity';
import { PaymentComment } from '../entities/postgresql/PaymentComment.entity';
import { pgDataSource } from '../lib/typeorm';

// ✅ Schemas para validação
const CreatePaymentSchema = Type.Object({
  amount: Type.Number({ minimum: 0.01 }),
  currency: Type.String({ minLength: 3, maxLength: 3 }),
  payee: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  dueDate: Type.Optional(Type.String({ format: 'date-time' })),
});

const AddCommentSchema = Type.Object({
  comment: Type.String({ minLength: 1 }),
  actionType: Type.Optional(Type.String()),
  isInternal: Type.Optional(Type.Boolean()),
});

const UpdateStatusSchema = Type.Object({
  status: Type.Enum(PaymentStatus),
  rejectionReason: Type.Optional(Type.String()),
});

type CreatePaymentBody = Static<typeof CreatePaymentSchema>;
type AddCommentBody = Static<typeof AddCommentSchema>;
type UpdateStatusBody = Static<typeof UpdateStatusSchema>;

export default async function paymentsRoutes(
  server: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // ✅ GET /payments - Listar pagamentos do usuário
  server.get(
    '/',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.user.sub;
        const paymentRepo = pgDataSource.getRepository(Payment);

        const payments = await paymentRepo.find({
          where: [{ requesterId: userId }, { approverId: userId }],
          relations: ['requester', 'approver'],
          order: { createdAt: 'DESC' },
          take: 50,
        });

        return {
          status: 'success',
          data: payments,
          count: payments.length,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // ✅ GET /payments/:id - Detalhes de um pagamento
  server.get(
    '/:id',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const paymentRepo = pgDataSource.getRepository(Payment);

        const payment = await paymentRepo.findOne({
          where: { id },
          relations: [
            'requester',
            'approver',
            'canceller',
            'comments',
            'comments.user',
            'attachments',
            'attachments.uploadedBy',
          ],
        });

        if (!payment) {
          return reply.code(404).send({
            status: 'error',
            message: 'Payment not found',
          });
        }

        return {
          status: 'success',
          data: payment,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // ✅ POST /payments - Criar novo pagamento (CORRIGIDO)
  server.post<{ Body: CreatePaymentBody }>(
    '/',
    {
      preHandler: [server.authenticate],
      schema: {
        body: CreatePaymentSchema,
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user.sub;
        const paymentRepo = pgDataSource.getRepository(Payment);

        // ✅ FIX: Criar payment com verificações de undefined
        const payment = new Payment();
        payment.amount = request.body.amount;
        payment.currency = request.body.currency;
        payment.payee = request.body.payee;
        payment.requesterId = userId;
        payment.status = PaymentStatus.PENDING;

        // ✅ FIX: Verificar se description existe antes de atribuir
        if (request.body.description !== undefined) {
          payment.description = request.body.description;
        }

        // ✅ FIX: Verificar se dueDate existe antes de atribuir
        if (request.body.dueDate !== undefined) {
          payment.dueDate = new Date(request.body.dueDate);
        }

        const savedPayment = await paymentRepo.save(payment);

        // Buscar com relacionamentos para retornar completo
        const fullPayment = await paymentRepo.findOne({
          where: { id: savedPayment.id },
          relations: ['requester'],
        });

        return reply.code(201).send({
          status: 'success',
          data: fullPayment,
          message: 'Payment created successfully',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // ✅ PUT /payments/:id/status - Atualizar status
  server.put<{ Body: UpdateStatusBody; Params: { id: string } }>(
    '/:id/status',
    {
      preHandler: [server.authenticate],
      schema: {
        body: UpdateStatusSchema,
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.user.sub;
        const { status, rejectionReason } = request.body;

        const paymentRepo = pgDataSource.getRepository(Payment);
        const commentRepo = pgDataSource.getRepository(PaymentComment);

        const payment = await paymentRepo.findOne({
          where: { id },
          relations: ['requester'],
        });

        if (!payment) {
          return reply.code(404).send({
            status: 'error',
            message: 'Payment not found',
          });
        }

        // Atualizar status
        payment.status = status;

        if (status === PaymentStatus.APPROVED) {
          payment.approverId = userId;
          payment.approvedAt = new Date();
        } else if (
          status === PaymentStatus.REJECTED &&
          rejectionReason !== undefined
        ) {
          payment.rejectionReason = rejectionReason;
        } else if (status === PaymentStatus.CANCELLED) {
          payment.cancellerId = userId;
          payment.cancelledAt = new Date();
        }

        await paymentRepo.save(payment);

        // Adicionar comentário automático
        const actionType =
          status === PaymentStatus.APPROVED
            ? 'APPROVAL'
            : status === PaymentStatus.REJECTED
            ? 'REJECTION'
            : 'CANCELLATION';

        const comment = new PaymentComment();
        comment.paymentId = payment.id;
        comment.userId = userId;
        comment.comment = rejectionReason || `Payment ${status.toLowerCase()}`;
        comment.actionType = actionType;
        comment.isInternal = false;

        await commentRepo.save(comment);

        return {
          status: 'success',
          data: payment,
          message: `Payment ${status.toLowerCase()} successfully`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // ✅ POST /payments/:id/comments - Adicionar comentário
  server.post<{ Body: AddCommentBody; Params: { id: string } }>(
    '/:id/comments',
    {
      preHandler: [server.authenticate],
      schema: {
        body: AddCommentSchema,
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.user.sub;

        const paymentRepo = pgDataSource.getRepository(Payment);
        const commentRepo = pgDataSource.getRepository(PaymentComment);

        const payment = await paymentRepo.findOne({ where: { id } });
        if (!payment) {
          return reply.code(404).send({
            status: 'error',
            message: 'Payment not found',
          });
        }

        const comment = new PaymentComment();
        comment.paymentId = id;
        comment.userId = userId;
        comment.comment = request.body.comment;
        comment.actionType = request.body.actionType || 'COMMENT';
        comment.isInternal = request.body.isInternal || false;

        const savedComment = await commentRepo.save(comment);

        const fullComment = await commentRepo.findOne({
          where: { id: savedComment.id },
          relations: ['user'],
        });

        return reply.code(201).send({
          status: 'success',
          data: fullComment,
          message: 'Comment added successfully',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );

  // ✅ GET /payments/:id/comments - Listar comentários
  server.get(
    '/:id/comments',
    {
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const commentRepo = pgDataSource.getRepository(PaymentComment);

        const comments = await commentRepo.find({
          where: { paymentId: id },
          relations: ['user'],
          order: { createdAt: 'ASC' },
        });

        return {
          status: 'success',
          data: comments,
          count: comments.length,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return reply.code(500).send({
          status: 'error',
          message: errorMessage,
        });
      }
    }
  );
}
