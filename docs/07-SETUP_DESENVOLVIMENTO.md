# 7. Guia de Setup do Ambiente de Desenvolvimento

Este documento fornece um guia passo a passo detalhado para configurar o ambiente de desenvolvimento do projeto "Aprovador de Pagamentos Digital" em uma nova máquina.

## 7.1. Pré-requisitos de Software

Antes de começar, garanta que os seguintes softwares estão instalados e configurados corretamente no seu sistema operacional:

1.  **Node.js:**

    - **Versão:** LTS recomendada (ex: v18.x, v20.x).
    - **Como verificar:** `node -v`
    - **Instalação:** Recomendamos usar um gerenciador de versões Node como o [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) para Linux/macOS ou [NVM for Windows](https://github.com/coreybutler/nvm-windows) para Windows. Isso permite alternar facilmente entre versões do Node.js.
      - Exemplo com NVM: `nvm install --lts && nvm use --lts`

2.  **PNPM (Performant NPM):**

    - **Versão:** Mais recente estável (ex: v8.x, v9.x).
    - **Como verificar:** `pnpm -v`
    - **Instalação (se não tiver):** `npm install -g pnpm` (requer Node.js/npm já instalados).
    - **Por quê PNPM?** Escolhemos PNPM por sua eficiência no uso de disco (links simbólicos para `node_modules`) e bom suporte a workspaces (monorepo).

3.  **Git:**

    - **Versão:** Qualquer versão recente.
    - **Como verificar:** `git --version`
    - **Instalação:** [https://git-scm.com/downloads](https://git-scm.com/downloads)

4.  **Docker:**

    - **Versão:** Docker Desktop (Windows/macOS) ou Docker Engine (Linux) recente.
    - **Como verificar:** `docker --version`
    - **Instalação:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) (para Desktop) ou siga as instruções para Docker Engine no Linux.
    - **Por quê Docker?** Usamos para rodar o banco de dados PostgreSQL de forma isolada e consistente em qualquer ambiente de desenvolvimento.
    - **(Linux) KVM:** Para performance ideal do emulador Android (e Docker em algumas configurações), garanta que o KVM esteja habilitado e seu usuário tenha permissão.
      - Verifique: `kvm-ok`
      - Instale (Debian/Ubuntu): `sudo apt update && sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager`
      - Adicione usuário aos grupos: `sudo adduser $(whoami) libvirt && sudo adduser $(whoami) kvm` (requer logout/login ou reboot).

5.  **(Opcional, Recomendado) IDE:**
    - **Visual Studio Code (VS Code):** Recomendado.
    - **Extensões Sugeridas:** ESLint, Prettier, Prisma, EditorConfig, GitLens, Auto Rename Tag, Path Intellisense.

## 7.2. Configuração Inicial do Projeto

1.  **Clonar o Repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT_AQUI>
    cd aprovador-pagamentos # Ou o nome da pasta raiz do seu projeto
    ```

2.  **Instalar Dependências do Monorepo:**
    Execute na pasta raiz do projeto. O PNPM cuidará de instalar as dependências de todos os workspaces (`api`, `mobile`, `shared-types`).
    ```bash
    pnpm install
    ```
    Este processo pode levar alguns minutos na primeira vez.

## 7.3. Configuração do Backend (`packages/api`)

### 7.3.1. Variáveis de Ambiente

1.  Navegue até a pasta da API: `cd packages/api`
2.  Copie o arquivo de exemplo para criar seu arquivo de configuração local:
    ```bash
    cp .env.example .env
    ```
3.  Abra o arquivo `.env` recém-criado com um editor de texto.
4.  **Preencha todas as variáveis** com valores apropriados para o seu ambiente local:
    - **`PORT`**: Porta onde o servidor da API rodará (ex: `3333`).
    - **`HOST`**: Host para o servidor (geralmente `0.0.0.0` para desenvolvimento, permitindo acesso de outros dispositivos na rede local, como o celular com Expo Go).
    - **`DATABASE_URL`**: A string de conexão completa para o banco de dados PostgreSQL.
      - Formato: `postgresql://USUARIO:SENHA@HOST_DO_BANCO:PORTA_DO_BANCO/NOME_DO_BANCO?schema=public`
      - Para o Docker (próximo passo), será: `postgresql://docker:docker@localhost:5432/aprovador_db?schema=public`
    - **`JWT_SECRET`**: Uma string longa, complexa e aleatória usada para assinar os tokens JWT. **NÃO use valores fracos ou exemplos!**
      - Para gerar um segredo forte no terminal (Linux/macOS): `openssl rand -hex 32` (gera 64 caracteres hexadecimais).
    - **`JWT_EXPIRES_IN`**: Tempo de validade do token de acesso (ex: `15m` para 15 minutos, `1h` para 1 hora, `7d` para 7 dias).
5.  Salve o arquivo `.env`. **Este arquivo não é versionado pelo Git.**
6.  Volte para a pasta raiz do monorepo: `cd ../..`

### 7.3.2. Configuração do Banco de Dados (PostgreSQL com Docker)

1.  **Verifique se o Docker está em execução.**
2.  **Execute o Container (se ainda não existir ou quiser um novo):**
    ```bash
    docker run --name pg-aprovador-dev -e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker -e POSTGRES_DB=aprovador_db -p 5432:5432 -d postgres:15
    ```
    - `--name pg-aprovador-dev`: Nome do container. Se já existir um com esse nome, este comando falhará.
    - Se o container já existe e está parado, inicie-o com: `docker start pg-aprovador-dev`
    - Se quiser remover um container existente com esse nome: `docker stop pg-aprovador-dev && docker rm pg-aprovador-dev`
3.  **Aguarde a Inicialização:** Espere cerca de 15-20 segundos para o PostgreSQL inicializar dentro do container.
4.  **Verifique o Status do Container:**
    ```bash
    docker ps
    ```
    (Deve listar `pg-aprovador-dev` com status "Up"). Você também pode ver os logs com: `docker logs pg-aprovador-dev`

### 7.3.3. Migrações do Banco (Prisma)

1.  Com o container Docker rodando e a `DATABASE_URL` configurada no `.env`, aplique as migrações para criar as tabelas no banco. Execute na **raiz** do monorepo:
    ```bash
    pnpm --filter api exec npx prisma migrate dev
    ```
    - Na primeira vez em um banco novo, ele aplicará todas as migrações existentes. Dê um nome se ele pedir (ex: `initial_setup_local_dev`).
2.  **(Opcional) Verifique os Dados com Prisma Studio:**
    ```bash
    pnpm --filter api exec npx prisma studio
    ```
    Isso abrirá uma interface web para visualizar e editar os dados do seu banco. Útil para adicionar usuários de teste.

### 7.3.4. Geração do Prisma Client

Garanta que o cliente Prisma TypeScript esteja gerado e atualizado (o `migrate dev` geralmente faz isso, mas não custa garantir):

```bash
pnpm --filter api exec npx prisma generate
```

### 7.4. Configuração do Frontend (packages/mobile)

O frontend (packages/mobile) geralmente não requer um arquivo .env para sua configuração inicial básica, pois ele consome a API backend que está rodando localmente. As configurações de URL da API são tratadas internamente no código do serviço (ex: services/apiClient.ts usando expo-constants para tentar detectar o IP local ou usando localhost).

No futuro, se o app mobile precisar de chaves de API para serviços de terceiros (mapas, notificações push, etc.), elas seriam configuradas via variáveis de ambiente específicas da Expo.

### 7.5. Rodando os Ambientes de Desenvolvimento

Execute cada comando em um terminal separado, a partir da raiz do monorepo (aprovador-pagamentos/).

1. Rodar o Backend (API):

```bash

pnpm run dev:api
Rodar o Frontend (App Mobile):
```

- A API estará disponível em http://localhost:<PORTA_DO_SEU_ENV> (ex: http://localhost:3333).
  Verifique a saúde da API acessando http://localhost:3333/ping no navegador ou Postman/Insomnia.
- A documentação interativa Swagger/OpenAPI estará em http://localhost:3333/docs.

```bash
pnpm run dev:mobile -- --clear
```

- O comando -- --clear passa a flag --clear para o expo start, limpando o cache do Metro Bundler, o que é recomendado após instalações ou grandes mudanças.
- Isso iniciará o Metro Bundler da Expo. Siga as instruções no terminal:
  - Pressione a para abrir no Emulador Android (requer Android Studio com um AVD configurado e em execução).
  - Pressione i para abrir no Simulador iOS (requer macOS com Xcode e simuladores configurados).
  - Pressione w para abrir no navegador (para a versão web do app, se suportada/configurada).
  - Escaneie o QR Code com o aplicativo Expo Go no seu dispositivo físico (iOS ou Android) para rodar diretamente no celular. Seu computador e o dispositivo móvel devem estar na mesma rede Wi-Fi.

### 7.6. Comandos Úteis

- Checagem de Tipos TypeScript (em todos os pacotes):

```bash
pnpm run typecheck # Script configurado na raiz para rodar em todos os workspaces
```

- Checagem de Tipos TypeScript (pacote específico, ex: api):

```bash
pnpm run typecheck:api # Script configurado na raiz
# Ou pnpm --filter api exec tsc --noEmit
```

- Limpeza Profunda de Dependências (se algo estiver estranho):

```bash
# Pare todos os servidores de desenvolvimento

rm -rf node_modules packages/\*/node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
# Após isso, para a API, rode:
pnpm --filter api exec npx prisma generate
# E então reinicie os servidores de desenvolvimento (com --clear para o mobile)
```

### 7.7. (Futuro) Troubleshooting Comum

_(Esta seção pode ser preenchida conforme problemas comuns de setup ou desenvolvimento apareçam e suas soluções sejam descobertas)._

- Conflitos de porta entre serviços.
- Problemas com o Docker (container não inicia, credenciais do banco incorretas no .env).
- Erros de tipo persistentes (verificar tsconfig.json dos pacotes, cache do TS Server no VS Code).
- Falhas na geração do Prisma Client.
- Problemas de conexão entre o Expo Go e o Metro Bundler (verificar rede Wi-Fi, firewall).
