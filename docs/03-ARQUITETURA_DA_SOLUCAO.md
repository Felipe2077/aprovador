# 3. Arquitetura da Solução

Este documento descreve a arquitetura de alto nível do sistema "Aprovador de Pagamentos Digital", as tecnologias empregadas e as principais decisões de design.

## 3.1. Visão Geral da Arquitetura

O sistema é construído utilizando uma arquitetura Monorepo, gerenciada com PNPM Workspaces. Ele é composto pelas seguintes partes principais:

- **Backend (API):** Um servidor Node.js construído com o framework Fastify, responsável por toda a lógica de negócio, autenticação, autorização, gerenciamento do fluxo de aprovação, interação com o banco de dados PostgreSQL e **integração direta com o banco Oracle do ERP via consultas SQL**.
- **Frontend (Aplicativo Mobile):** Um aplicativo mobile multiplataforma desenvolvido com React Native e Expo, que consome a API backend para fornecer a interface do usuário para solicitantes, aprovadores e o departamento financeiro.
- **Banco de Dados PostgreSQL:** Banco principal para persistir os dados gerenciados pelo nosso sistema (usuários, estado das APs no nosso fluxo, comentários, anexos, logs de auditoria) **e cache rico dos dados do ERP para operação autônoma**.
- **Banco Oracle ERP:** **Integração read-only via consultas SQL diretas para sincronização de dados de APs, fornecedores, usuários, histórico e anexos**.
- **Tipos Compartilhados:** Um pacote dedicado (`shared-types`) dentro do monorepo para definir interfaces e Enums TypeScript comuns, garantindo consistência entre o backend e o frontend.
- **ETL/Sincronização:** **Sistema automatizado de sincronização que executa consultas SQL no Oracle e mantém o PostgreSQL atualizado com dados completos para operação resiliente**.

## 3.2. Diagrama de Arquitetura de Alto Nível

**Arquitetura Resiliente com PostgreSQL Rico:**

```
┌─────────────────┐    ETL Rico     ┌──────────────────┐    API/Mobile   ┌─────────────────┐
│   Oracle ERP    │ ──────────────→ │   PostgreSQL     │ ──────────────→ │   Aplicativo    │
│   (GLOBUS)      │                 │   (Cache Rico)   │                 │   Mobile        │
│                 │                 │                  │                 │                 │
│ • Source Truth  │                 │ • Dados Completos│                 │ • Sempre        │
│ • Consultas SQL │                 │ • Operação       │                 │   Funciona      │
│ • Anexos BLOB   │                 │   Autônoma       │                 │ • Performance   │
│ • Validação     │                 │ • Anexos Locais  │                 │ • Resiliente    │
└─────────────────┘                 └──────────────────┘                 └─────────────────┘
```

## 3.3. Tecnologias (Stack Tecnológico)

- **Monorepo:**
  - PNPM Workspaces
- **Backend (`packages/api`):**
  - **Runtime:** Node.js (v18+)
  - **Framework Web:** Fastify
  - **Linguagem:** TypeScript
  - **ORM:** **TypeORM (para PostgreSQL e Oracle)**
  - **Banco de Dados Principal:** PostgreSQL
  - **Integração ERP:** **Oracle Database (consultas SQL diretas)**
  - **Autenticação:** JWT (JSON Web Tokens)
  - **Documentação API:** Swagger/OpenAPI (via `@fastify/swagger`)
  - **Validação:** Typebox (para schemas Fastify)
- **Frontend (`packages/mobile`):**
  - **Framework:** React Native (gerenciado com Expo)
  - **Linguagem:** TypeScript
  - **Navegação:** Expo Router
  - **Gerenciamento de Estado:** Zustand
  - **Componentes de UI:** React Native Tab View, Componentes customizados
  - **Comunicação API:** Axios (para chamadas HTTP)
  - **Armazenamento Seguro:** Expo Secure Store (para token JWT)
  - **Ícones:** `@expo/vector-icons`
  - **Efeitos Visuais:** `react-native-skeleton-placeholder`, `react-native-linear-gradient`
- **Tipos Compartilhados (`packages/shared-types`):**
  - TypeScript
- **Banco de Dados:**
  - **PostgreSQL** (cache rico + dados próprios)
  - **Oracle** (ERP - read-only via SQL)

## 3.4. Estrutura de Pastas Principais

- **`packages/api/src/`**:
  - `config/`: Configurações, como schemas de variáveis de ambiente **e conexões de banco (PostgreSQL + Oracle)**.
  - `lib/`: Utilitários de baixo nível (ex: hash de senha, instâncias do TypeORM para PostgreSQL e Oracle).
  - `plugins/`: Plugins Fastify para funcionalidades transversais (CORS, JWT, Auth, Swagger).
  - `routes/`: Definição dos endpoints da API, agrupados por recurso.
  - `services/`: Lógica de negócio, **ETL de sincronização Oracle → PostgreSQL**, e interação com os bancos.
  - **`entities/`**: Entidades TypeORM para PostgreSQL e Oracle.
  - **`jobs/`**: Jobs de sincronização e ETL automatizados.
  - `server.ts`: Ponto de entrada, configuração e inicialização do servidor Fastify.
- **`packages/mobile/`**:
  - `app/`: Estrutura de rotas (Expo Router).
  - `assets/`: Fontes, imagens.
  - `components/`: Componentes React Native reutilizáveis.
  - `constants/`: Constantes (ex: Cores, Layout).
  - `context/`: Contextos React (ex: AuthContext, se criado).
  - `data/`: Dados mock (usados no desenvolvimento inicial).
  - `services/`: Funções para interagir com a API backend.
  - `store/`: Lógica de gerenciamento de estado global (Zustand).
  - `styles/`: Arquivos de estilos reutilizáveis ou específicos de telas/componentes.
  - `theme/`: Definições de tema (ex: AppDarkTheme).
- **`packages/shared-types/src/`**:
  - `enums/`: Definições de Enums compartilhados.
  - `types/`: Definições de Interfaces TypeScript compartilhadas.
  - `index.ts`: Ponto de entrada que exporta todos os tipos e enums.

## 3.5. Fluxo de Dados Principal (Alto Nível)

1. Uma Requisição de Pagamento (AP) é criada no sistema **Oracle ERP**.
2. **O sistema ETL (executado a cada 15 minutos) faz consultas SQL diretas no Oracle para identificar APs novas ou modificadas**.
3. **Os dados são processados e armazenados de forma completa no PostgreSQL, incluindo anexos (BLOB), dados de fornecedores, histórico e metadados**.
4. O **Aplicativo Mobile** busca dados da nossa **API Backend que consulta principalmente o PostgreSQL (operação local rápida)**.
5. O **Solicitante** usa o App Mobile para definir a **sequência de aprovadores** para a AP. Essa informação é salva no PostgreSQL.
6. A AP segue a sequência de aprovação:
   - O App Mobile mostra a AP para o **aprovador da vez** (dados do PostgreSQL).
   - **Para operações críticas, o sistema pode validar o estado atual consultando o Oracle diretamente**.
   - Aprovações/rejeições são salvas no PostgreSQL com histórico completo.
7. O **Departamento Financeiro** registra pagamentos e anexa comprovantes no sistema (PostgreSQL).
8. **Sistema opera de forma totalmente autônoma mesmo com Oracle offline, usando dados cached no PostgreSQL**.

## 3.6. Decisões Arquiteturais Chave (Rationale)

- **Monorepo (PNPM Workspaces):** Facilita o compartilhamento de código (especialmente `shared-types`), a consistência de dependências e a execução de scripts em um ambiente unificado.
- **Fastify (Backend):** Escolhido por sua alta performance, baixo overhead, extensibilidade via plugins e bom suporte a TypeScript e schemas de validação (Typebox).
- **TypeORM (Backend):** **Substituição do Prisma para suportar múltiplas conexões de banco (PostgreSQL + Oracle) com queries SQL diretas quando necessário**.
- **Expo (Frontend Mobile):** Simplifica o desenvolvimento React Native, oferece um ótimo fluxo de trabalho, acesso a uma vasta gama de APIs nativas e facilita o processo de build e publicação.
- **Expo Router (Frontend Mobile):** Fornece um sistema de navegação moderno e robusto baseado em arquivos, com bom suporte a layouts e navegação tipada.
- **Zustand (Frontend Mobile):** Escolhido para gerenciamento de estado global por sua simplicidade, flexibilidade e baixo boilerplate.
- **TypeScript (Em todo o projeto):** Garante segurança de tipos, melhora a manutenibilidade e a experiência de desenvolvimento em projetos maiores.
- **Arquitetura Resiliente:** **PostgreSQL como cache rico permite operação 100% autônoma, com Oracle como source of truth para sincronização**.
- **ETL Rico:** **Sincronização completa de dados (incluindo anexos) garante que o sistema nunca pare de funcionar**.
- **Componentização (Frontend):** Foco em criar componentes reutilizáveis e manter os componentes de tela enxutos.
