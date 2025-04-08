// packages/api/src/plugins/swagger.ts
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

/**
 * Configura o Swagger (OpenAPI) para documentação da API e
 * o Swagger UI para uma interface web interativa.
 */
export default fp(async (server) => {
  // 1. Registra o plugin principal do Swagger
  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API Aprovador Pagamentos',
        description: 'Backend API para o sistema de aprovação de pagamentos.',
        version: '0.1.0', // Versão inicial da sua API
      },
      // Poderíamos adicionar servers, components (schemas globais), securitySchemes aqui depois
      // servers: [{ url: 'http://localhost:3333', description: 'Development server' }],
    },
    // Usa o transform para garantir que os schemas do Typebox sejam convertidos corretamente
  });

  // 2. Registra o plugin para a Interface do Usuário (UI) do Swagger
  await server.register(fastifySwaggerUI, {
    routePrefix: '/docs', // Endpoint onde a documentação estará acessível (ex: http://localhost:3333/docs)
    uiConfig: {
      docExpansion: 'list', // 'list' ou 'full' ou 'none' (como os endpoints aparecem inicialmente)
      deepLinking: true, // Permite links diretos para operações/tags
      persistAuthorization: true, // Mantém o token de autorização entre reloads da página (útil para testar rotas protegidas)
    },
    // Configurações para Content Security Policy se o Helmet estiver ativo e rigoroso
    // Pode ser necessário ajustar baseado na sua config do Helmet
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  server.log.info(`Swagger UI registered at /docs`);
});
