# Aprovador de Pagamentos 💸

Aplicativo mobile (React Native/Expo) com backend (Node/Fastify/Prisma) para gerenciar e aprovar solicitações de pagamento de forma digital e segura, integrando com dados de um sistema ERP externo.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas na sua máquina:

- **Node.js:** (v18 ou superior recomendado) - `node -v`
- **pnpm:** (v8 ou superior recomendado) - `pnpm -v` (Instale com `npm install -g pnpm` se necessário)
- **Git:** `git --version`
- **Docker:** (Docker Desktop ou Docker Engine) - `docker --version` (Necessário para rodar o banco de dados PostgreSQL localmente)

## 🚀 Começando (Setup Local)

Siga estes passos para configurar o ambiente de desenvolvimento:

1.  **Clone o Repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT>
    cd aprovador-pagamentos
    ```

2.  **Instale as Dependências:**
    Este comando instalará todas as dependências para todos os pacotes (api, mobile, shared-types) no monorepo. Execute na pasta raiz (`aprovador-pagamentos/`).

    ```bash
    pnpm install
    ```

3.  **Configure as Variáveis de Ambiente (Backend):**

    - Navegue até a pasta da API: `cd packages/api`
    - Copie o arquivo de exemplo: `cp .env.example .env`
    - **Edite** o arquivo `.env` recém-criado e preencha **TODAS** as variáveis com valores válidos para o seu ambiente local:
      - `PORT`: Porta para a API (ex: 3333)
      - `HOST`: Host para a API (ex: 0.0.0.0)
      - `DATABASE_URL`: String de conexão para o banco PostgreSQL (veja próximo passo). Formato: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
      - `JWT_SECRET`: Uma string longa, segura e aleatória para assinar os tokens JWT.
      - `JWT_EXPIRES_IN`: Tempo de expiração do token (ex: `15m`, `1h`, `1d`).
    - Volte para a raiz: `cd ../..`
    - **IMPORTANTE:** O arquivo `.env` **não** deve ser commitado no Git!

4.  **Configure e Rode o Banco de Dados (PostgreSQL com Docker):**

    - Certifique-se que o Docker está rodando.
    - Execute o comando abaixo (apenas uma vez para criar o container) no seu terminal (fora da pasta do projeto, se preferir):
      ```bash
      docker run --name pg-aprovador-dev -e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker -e POSTGRES_DB=aprovador_db -p 5432:5432 -d postgres:15
      ```
      _(Use um nome como `pg-aprovador-dev`. Se já criou com outro nome, use `docker start <nome_antigo>` em vez de `docker run`)_.
    - Aguarde alguns segundos para o banco inicializar após iniciar o container.
    - Verifique se a `DATABASE_URL` no seu `packages/api/.env` corresponde aos dados usados aqui (user `docker`, pass `docker`, host `localhost`, port `5432`, db `aprovador_db`).

5.  **Execute as Migrações do Banco de Dados:**

    - Este comando criará as tabelas (`users`, `payments`, etc.) no banco de dados Docker com base no schema Prisma. Execute na **raiz** do monorepo:
      ```bash
      pnpm --filter api exec npx prisma migrate dev
      ```
      _(Pode ser que ele peça um nome para a migração se for a primeira vez ou se detectar mudanças. Se for o caso, dê um nome como `initial-setup`)_.

6.  **(Opcional) Gere o Prisma Client (se necessário):**
    - O `migrate dev` geralmente já faz isso, mas se tiver problemas de tipo com o Prisma Client, rode manualmente:
      ```bash
      pnpm --filter api exec npx prisma generate
      ```

## 💻 Rodando Localmente

Para rodar os ambientes de desenvolvimento:

1.  **Backend (API):** Abra um terminal na **raiz** do monorepo e rode:

    ```bash
    pnpm run dev:api
    ```

    A API estará rodando em `http://localhost:PORTA` (ex: 3333) e você verá os logs. Teste com `http://localhost:PORTA/ping`.

2.  **Frontend (Mobile App):** Abra **outro** terminal na **raiz** do monorepo e rode o comando para iniciar o Expo (ajuste conforme seu script):
    ```bash
    pnpm run dev:mobile
    # Ou: pnpm run ios:mobile / pnpm run android:mobile
    ```
    Siga as instruções do Expo para abrir no simulador/emulador ou no seu dispositivo físico via Expo Go.

## 📂 Estrutura do Monorepo

Este repositório usa `pnpm` workspaces para gerenciar múltiplos pacotes:

- `packages/api/`: O backend Node.js/Fastify/Prisma.
- `packages/mobile/`: O frontend React Native/Expo.
- `packages/shared-types/`: Tipos e Enums TypeScript compartilhados entre `api` e `mobile`.

## ✨ Tecnologias Principais

- **Monorepo:** PNPM Workspaces
- **Backend:** Node.js, Fastify, TypeScript, Prisma, PostgreSQL
- **Frontend:** React Native, Expo, TypeScript, Expo Router, Zustand, React Native Tab View
- **Banco de Dados:** PostgreSQL (rodando em Docker para dev)
- **Autenticação:** JWT

---
