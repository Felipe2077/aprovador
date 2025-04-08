// packages/api/src/lib/authUtils.ts
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Verifica se o usuário autenticado na requisição tem o papel 'DIRECTOR'.
 * Se não tiver (ou não estiver autenticado), envia uma resposta 403 Forbidden.
 * @param request O objeto de requisição do Fastify (espera-se que request.user esteja populado)
 * @param reply O objeto de resposta do Fastify
 */
export async function verifyDirectorRole(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = request.user; // Pega o usuário do token (populado pelo authenticate)

  // Se não há usuário ou o papel não é DIRECTOR
  if (!user || user.role !== 'DIRECTOR') {
    await reply
      .code(403)
      .send({ message: 'Forbidden: Director role required' });
    // A execução da rota para aqui se o reply.send for chamado
  }
  // Se for diretor, a função termina sem fazer nada, permitindo a continuação
}

/**
 * Verifica se o usuário autenticado na requisição tem o papel 'REQUESTER'.
 * Se não tiver (ou não estiver autenticado), envia uma resposta 403 Forbidden.
 * @param request O objeto de requisição do Fastify
 * @param reply O objeto de resposta do Fastify
 */
export async function verifyRequesterRole(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = request.user;

  if (!user || user.role !== 'REQUESTER') {
    await reply
      .code(403)
      .send({ message: 'Forbidden: Requester role required' });
  }
}

// Poderíamos adicionar mais verificações granulares aqui no futuro.
