# Estudo de NestJS

Este repositório é um projeto de estudo para retomar a prática de desenvolvimento backend com Node.js e NestJS.

Estou usando este projeto para desenferrujar meus conhecimentos e reconstruir familiaridade com uma aplicação backend mais completa. Faz cerca de cinco anos que não trabalho em algo mais complexo, então a ideia aqui é avançar de forma incremental, revisitando conceitos, ferramentas e decisões comuns no desenvolvimento de APIs.

O código, as escolhas técnicas e a documentação refletem o estado atual do estudo.

## Objetivos de estudo

- Revisar a organização modular do NestJS, incluindo a evolução para um "monolito modular" (módulos de domínio isolados sob `src/modules`, infra compartilhada isolada em `src/database` e `src/shared`, fronteiras entre módulos via barrel `index.ts`).
- Praticar controllers, services, DTOs e injeção de dependências.
- Implementar autenticação com JWT e autenticação de dois fatores (2FA/TOTP).
- Trabalhar com validação de dados recebidos pela API.
- Integrar uma aplicação NestJS com PostgreSQL.
- Usar Prisma ORM (schema, migrations e Prisma Client) para acesso a dados.
- Estudar idempotência em operações financeiras (módulo `budget`, com `Ledger`/`Balance` versionado e lock de idempotência via Redis) e experimentar entrega de eventos via SSE com padrão outbox (poll em `Ledger` + cursor `publishedAt`).
- Implementar sessão/logout com revogação de token (tabela `Session`, vinculada ao usuário e ao JWT emitido).
- Experimentar full-text search nativo do PostgreSQL (módulo `products`): coluna `tsvector` gerada por trigger a partir de `name`/`description`, índice `GIN` e busca via `websearch_to_tsquery` + `ts_rank`, com `$queryRaw` do Prisma (coluna `Unsupported("tsvector")` no schema).
- Praticar CRUD completo com paginação por cursor (módulo `products`): listagem e busca full-text paginadas por cursor opaco em base64 (`id` na listagem; `rank,id` combinados na busca), `slug` único como identificador amigável, e soft delete via extensão do `PrismaService`.
- Praticar hashing de senha com pepper (`argon2id`) e criptografia simétrica reversível (AES-256-GCM) pro segredo 2FA, que precisa ser recuperado em texto puro pra validar o TOTP.
- Persistir dados com MongoDB via Mongoose (módulo `cart`): schema com `_id` UUIDv7 (`uuidv7`), índice TTL pra expirar carrinhos inativos automaticamente, e agregação de itens (soma de quantidade por `productId` duplicado + cálculo do total) feita em memória no service via `reduce`.
- Estudar o padrão circuit breaker com `opossum`: decorator `@UseCircuitBrake` com os estados CLOSED/OPEN/HALF-OPEN, fallback resolvido por nome de método na instância e simulação de todos os estágios no módulo `banks`.
- Recuperar familiaridade com testes, configuração e execução de aplicações backend.

## Tecnologias

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Redis (suporte ao estudo de idempotência), via cliente `ioredis`
- MongoDB com Mongoose (`mongoose` + `@nestjs/mongoose`) — carrinho de compras (módulo `cart`)
- Docker e Docker Compose
- Prisma ORM (`@prisma/client`, driver adapter `@prisma/adapter-pg`), incluindo o preview feature `fullTextSearchPostgres` e tipo `Unsupported("tsvector")` pra busca full-text nativa do Postgres
- JSON Web Token (JWT) e Passport
- Hash de senha com `argon2` (argon2id) + pepper
- Autenticação de dois fatores (TOTP) com `otplib` e QR Code (`qrcode`), segredo criptografado em repouso (AES-256-GCM)
- Circuit breaker com `opossum`
- Manipulação de datas com `date-fns` e `@date-fns/tz`
- Swagger para documentação da API
- Jest e Supertest

## Estrutura atual

```text
src/
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── tests/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── banks/
│   │   ├── dto/
│   │   ├── repositories/   # interface + implementação Prisma
│   │   ├── tests/
│   │   ├── banks.controller.ts
│   │   ├── banks.module.ts
│   │   ├── banks.service.ts
│   │   └── index.ts
│   ├── clock/
│   │   ├── dto/
│   │   ├── tests/
│   │   ├── clock.controller.ts
│   │   ├── clock.module.ts
│   │   ├── clock.service.ts
│   │   └── index.ts
│   ├── budget/
│   │   ├── dto/
│   │   ├── types/
│   │   ├── repository/   # interfaces + implementação Prisma (balance, ledger)
│   │   ├── tests/
│   │   ├── budget.controller.ts
│   │   ├── budget.service.ts   # facade: delega pra balance.service / ledger.service
│   │   ├── balance.service.ts
│   │   ├── ledger.service.ts
│   │   ├── idempotency.interceptor.ts   # interceptor de idempotência (Redis)
│   │   ├── budget.module.ts
│   │   └── index.ts
│   ├── products/
│   │   ├── dto/
│   │   ├── repository/   # interface + implementação Prisma, inclui full-text search via $queryRaw
│   │   ├── tests/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   └── index.ts
│   └── cart/
│       ├── dto/
│       ├── repository/   # interface + implementação Mongoose (Cart)
│       ├── tests/
│       ├── cart.controller.ts
│       ├── cart.service.ts
│       └── cart.module.ts
├── database/
│   ├── index.ts   # barrel: reexporta Postgres (Prisma) e MongoDB (Mongoose)
│   ├── mongodb/
│   │   ├── mongo.module.ts
│   │   ├── mongo.service.ts
│   │   └── schemas/   # schemas Mongoose (ex.: cart.schema.ts)
│   └── postgresql/
│       ├── database.module.ts
│       ├── prisma.service.ts
│       └── index.ts
├── shared/
│   ├── decorators/
│   │   ├── circuit-braker.decorator.ts   # @UseCircuitBrake (opossum)
│   │   ├── is-tax-id.decorator.ts
│   │   ├── user.decorator.ts
│   │   └── index.ts
│   ├── filters/
│   │   └── http-exception.filter.ts   # filtro global de exceções (logs erro 500 inesperado)
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   └── utils/
│       ├── crypt.ts
│       ├── date.ts
│       ├── functions.ts
│       └── index.ts
├── tests/
├── register-paths.ts
├── repl.debug.ts   # entrypoint do REPL (`yarn debug`)
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

.vscode/
├── launch.json   # configuração "Debug Playground Nest"
└── settings.json

prisma/
├── schema/
│   ├── schema.prisma   # generator + datasource
│   ├── user.prisma
│   ├── bank.prisma
│   ├── ledger.prisma
│   ├── balance.prisma
│   ├── session.prisma
│   └── products.prisma   # coluna Unsupported("tsvector") + índice Gin pro full-text search
├── migrations/
├── seeds/
│   ├── banks.seed.sql   # principais instituições financeiras do Brasil
│   └── products.seed.ts   # gera ~2000 produtos (jogos retro) combinando título x condição x região x edição
└── seed.ts   # runner do seed (`npx prisma db seed`)

test/
└── jest-e2e.json   # config do Jest pros testes end-to-end (*.e2e-spec.ts)

skills/
└── nest-controller-generator.skill.md   # skill de geração de controllers seguindo os padrões do knowledge.md

jest.config.ts
knowledge.md   # base de conhecimento do projeto pra agentes de IA (ver seção "Base de conhecimento e skills")
prisma7.config.ts   # config do Prisma CLI (schema path + connection string)
docker-compose.yml
dockerfile
```

Cada módulo de domínio expõe só o que os outros precisam através do `index.ts` (barrel). Imports entre módulos usam aliases (`@auth`, `@banks`, `@clock`, `@database`, `@shared/decorators`, `@shared/utils`, `@prisma`) — a lista fica só em `tsconfig.json` (`baseUrl` + `paths`); tanto `jest.config.ts` (via `pathsToModuleNameMapper` do `ts-jest`) quanto `src/register-paths.ts` (resolução em runtime pro build compilado, via `tsconfig-paths`) leem esse mesmo arquivo em vez de duplicar a lista.

## Pré-requisitos

- Node.js instalado.
- Yarn instalado.
- Docker e Docker Compose instalados, caso queira executar PostgreSQL, Redis e MongoDB em container.

## Configuração

Instale as dependências:

```bash
yarn install
```

Crie o arquivo `.env` na raiz do projeto. O arquivo `.env.example` pode ser usado como referência:

```env
APP_NAME=EstudoNest

POSTGRES_HOST=host-do-banco
POSTGRES_USER=usuario-do-banco
POSTGRES_PASSWORD=senha-do-banco
POSTGRES_DB=nome-do-banco
POSTGRES_PORT=porta-do-banco

REDIS_HOST=host-do-redis
REDIS_PORT=porta-do-redis

MONGO_DB=nome-do-banco-mongo
MONGO_USERNAME=usuario-do-mongo
MONGO_PASSWORD=senha-do-mongo
MONGO_HOST=host-do-mongo
MONGO_PORT=porta-do-mongo

JWT_SECRET=uma-chave-secreta-para-desenvolvimento
TWO_FACTOR_SECRET_KEY=uma-chave-de-32-bytes-para-criptografar-o-segredo-2fa
PEPPER_SECRET=um-pepper-concatenado-a-senha-antes-do-hash

LOG_LEVEL=info
```

A connection string do PostgreSQL é montada a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` e `POSTGRES_DB`. Tanto o `PrismaService` (runtime, via `@prisma/adapter-pg`) quanto o `prisma7.config.ts` (Prisma CLI) usam essas mesmas variáveis. Redis (`REDIS_HOST`/`REDIS_PORT`) e MongoDB (`MONGO_*`) também são configurados só por variáveis separadas.

O serviço `app` do `docker-compose.yml` repassa essas variáveis do `.env` sem alterá-las, então o valor de `*_HOST` depende de onde a aplicação roda:

- Fora de container (`yarn start:dev`), contra os bancos do `docker-compose.yml`: `localhost`.
- Dentro do container `app`: nome do serviço no compose (`postgree`, `redis`, `mongoDB`) com a porta interna do serviço (`5432`, `6379`, `27017`).

O arquivo `.env` não deve ser versionado. Para ambientes reais, use uma chave JWT forte e mantenha os segredos fora do código-fonte.

## Banco de dados

Suba PostgreSQL, Redis e MongoDB com Docker Compose:

```bash
docker compose up -d
```

| Serviço    | Porta                    | Configuração                                                                           |
| ---------- | ------------------------ | -------------------------------------------------------------------------------------- |
| PostgreSQL | `POSTGRES_PORT` (`5432`) | usuário/senha/banco vindos de `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`        |
| Redis      | `REDIS_PORT` (`6379`)    | sem autenticação (uso local de estudo)                                                 |
| MongoDB    | `MONGO_PORT` (`27017`)   | usuário/senha root vindos de `MONGO_USERNAME`/`MONGO_PASSWORD` (`MONGO_INITDB_ROOT_*`) |

Para interromper os containers:

```bash
docker compose down
```

## Docker (aplicação)

O `docker-compose.yml` também define um serviço `app`, que builda a aplicação a partir do `dockerfile` (multi-stage: build + imagem final rodando como usuário não-root) e sobe junto com PostgreSQL, Redis e MongoDB:

```bash
docker compose up -d --build
```

O serviço `app` lê as variáveis de ambiente (`APP_NAME`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, etc.) do `.env` na raiz do projeto (ver a seção Configuração sobre os valores de `*_HOST` dentro do container) — e expõe a porta `3000`. O `dockerfile` inclui um `HEALTHCHECK` que bate em `/api/v1/health` (rota exposta por `AppController`).

## Executando o projeto

Modo de desenvolvimento com recarregamento automático:

```bash
yarn start:dev
```

Outros comandos disponíveis:

```bash
# execução normal
yarn start

# compilação
yarn build

# execução da versão compilada
yarn start:prod
```

A aplicação é iniciada, por padrão, na porta `3000`. Essa porta pode ser alterada pela variável `PORT`.

## Debug

### VSCode (breakpoints)

O `.vscode/launch.json` traz a configuração "Debug Playground Nest": sobe `src/main.ts` via `ts-node` (`-r ts-node/register -r tsconfig-paths/register`), sem precisar compilar antes, com `sourceMaps` habilitado — dá pra colocar breakpoint direto no `.ts`. Os aliases de import (`@auth`, `@prisma`, etc.) são resolvidos tanto em runtime (via `tsconfig-paths`, com fallback pra imports relativos `.js`→`.ts` do client do Prisma) quanto na leitura do `tsconfig.json` em si — o caminho do `tsconfig.json` é lido a partir de `process.cwd()` (não de `__dirname`), pra não depender da estrutura de pastas gerada pelo build.

Basta abrir a aba "Run and Debug" do VSCode e rodar "Debug Playground Nest".

### REPL

```bash
yarn debug
```

Roda `nest start --watch --entryFile repl.debug`, que usa `src/repl.debug.ts` (chama `repl(AppModule)` do `@nestjs/core`) como entrypoint em vez de `main.ts`. Abre um REPL Node interativo com todo o grafo de dependências da aplicação já carregado, sem subir o servidor HTTP.

Vantagens, de forma resumida:

- Testa lógica de service/repository isolada, sem passar por controller, guard ou pipe de validação;
- Inspeciona o retorno de uma chamada na hora, sem precisar espalhar `console.log` pelo código;
- Mantém hot-reload (`--watch`) — mudança no código reflete no REPL sem reiniciar manualmente.

Dentro do REPL, `get(NomeDaClasse)` retorna a instância do provider resolvida pelo Nest (ex.: `get(ProductsService)`) e `methods(NomeDaClasse)` lista os métodos públicos disponíveis.

## Rotas atuais

As rotas de autenticação usam o prefixo `/api/v1/auth`. O fluxo de login é feito em duas etapas: `signin` retorna um token temporário (`twoFactorAuthToken`), que deve ser enviado como Bearer token nas rotas de 2FA.

| Método | Rota                                     | Autenticação                | Finalidade                                                                                              |
| ------ | ---------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `POST` | `/auth/signin`                           | —                           | Login com e-mail e senha. Retorna `twoFactorAuthToken` e o próximo passo (`MFA_SYNC` ou `MFA_VALIDATE`) |
| `POST` | `/auth/sync-app-authenticator`           | Bearer `twoFactorAuthToken` | Gera segredo e QR Code para o usuário sincronizar o app authenticator (primeiro acesso)                 |
| `POST` | `/auth/verify-two-factor-authentication` | Bearer `twoFactorAuthToken` | Valida o código TOTP, persiste a sessão (tabela `Session`) e retorna o `accessToken` final              |
| `GET`  | `/auth/signout`                          | Bearer `accessToken`        | Revoga a sessão do `accessToken` enviado (marca `revokedAt` na tabela `Session`)                        |

`accessToken` (tipo `FULL_AUTH`) é validado contra a tabela `Session` a cada requisição (`JwtStrategy`), não só pela assinatura do JWT — isso permite revogar acesso antes da expiração natural do token via `/auth/signout`. `twoFactorAuthToken` (tipo `PRE_AUTH`) não passa por essa checagem, só pela assinatura/expiração do próprio JWT (TTL curto de 5 minutos).

As rotas de instituições financeiras usam o prefixo `/api/v1/banks` e exigem `accessToken` (Bearer) obtido no fluxo de 2FA.

| Método   | Rota         | Autenticação         | Finalidade                          |
| -------- | ------------ | -------------------- | ----------------------------------- |
| `GET`    | `/banks`     | Bearer `accessToken` | Lista instituições financeiras      |
| `GET`    | `/banks/:id` | Bearer `accessToken` | Busca instituição financeira por id |
| `POST`   | `/banks`     | Bearer `accessToken` | Cria instituição financeira         |
| `PUT`    | `/banks/:id` | Bearer `accessToken` | Atualiza instituição financeira     |
| `DELETE` | `/banks/:id` | Bearer `accessToken` | Remove instituição financeira       |

Além do CRUD, o módulo expõe `GET /banks/test-ciruit-breaker` (sem autenticação), que executa a simulação do circuit breaker descrita na seção [Circuit breaker](#circuit-breaker).

A rota de relógio usa o prefixo `/api/v1/clock` e exige `accessToken` (Bearer). É um endpoint SSE (Server-Sent Events) que emite a cada segundo.

| Método | Rota            | Autenticação         | Finalidade                                                         |
| ------ | --------------- | -------------------- | ------------------------------------------------------------------ |
| `GET`  | `/clock/stream` | Bearer `accessToken` | Stream SSE com timezone e timestamp atuais, emitido a cada segundo |

O módulo `budget` (prefixo `/api/v1/budget`) é o experimento de idempotência em operações financeiras — `Balance` é versionado (chave composta `userId` + `version`, sem coluna `id` própria) e `Ledger` registra cada lançamento (`RESERVED`/`REFUNDED`/`WITHDRAW`/`CREDITED`). As rotas de escrita (`reserve`, `cancel`, `confirm`) passam por `IdempotencyInterceptor`, que usa Redis como lock (`transactionId` do body vira chave, com TTL) pra impedir que a mesma requisição seja processada duas vezes.

| Método | Rota                     | Autenticação         | Finalidade                                                                                                                                                                                                                                                                                                          |
| ------ | ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/budget/balance`        | Bearer `accessToken` | Busca o saldo (versão mais recente) do usuário autenticado                                                                                                                                                                                                                                                          |
| `GET`  | `/budget/ledger`         | Bearer `accessToken` | Lista o histórico de lançamentos do usuário autenticado                                                                                                                                                                                                                                                             |
| `POST` | `/budget/reserve`        | Bearer `accessToken` | Reserva um valor do saldo disponível (bloqueia), idempotente por `transactionId`                                                                                                                                                                                                                                    |
| `POST` | `/budget/cancel`         | Bearer `accessToken` | Cancela uma reserva, devolve o valor ao saldo disponível                                                                                                                                                                                                                                                            |
| `POST` | `/budget/confirm`        | Bearer `accessToken` | Confirma (efetiva) uma reserva como saque                                                                                                                                                                                                                                                                           |
| `GET`  | `/budget/balance/stream` | Bearer `accessToken` | Stream SSE com o `Balance` atual do usuário, atualizado via padrão outbox (ver abaixo)                                                                                                                                                                                                                              |

O stream `/budget/balance/stream` usa o padrão outbox: a cada 5s faz poll em `Ledger` filtrando por `userId` e `publishedAt: null`, marca as linhas encontradas como publicadas e emite o `Balance` atual daquele usuário. `Ledger` funciona como fila (cursor `publishedAt`, entrega at-least-once) e `distinctUntilChanged` evita reemitir o mesmo estado.

As rotas de produtos usam o prefixo `/api/v1/products` e exigem `accessToken` (Bearer). `GET /products` e `GET /products/search` recebem os parâmetros por query string (`@Query()`).

| Método   | Rota               | Autenticação         | Finalidade                                                                                                                                       |
| -------- | ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/products`        | Bearer `accessToken` | Lista produtos com paginação por cursor: `pageSize` (default `10`) e `pageToken` (opcionais, na query string)                             |
| `GET`    | `/products/search` | Bearer `accessToken` | Busca full-text por `terms` (query string), paginada por cursor, usando `websearch_to_tsquery` + `ts_rank` contra a coluna `searchVector` |
| `GET`    | `/products/:slug`  | Bearer `accessToken` | Busca produto pelo `slug` (identificador único e amigável)                                                                                       |
| `POST`   | `/products`        | Bearer `accessToken` | Cria produto. `slug` é opcional no corpo — se omitido, é gerado a partir de `name` (`slugfy`)                                                    |
| `PUT`    | `/products/:id`    | Bearer `accessToken` | Atualiza produto                                                                                                                                 |
| `DELETE` | `/products/:id`    | Bearer `accessToken` | Remove produto — soft delete (marca `deletedAt`, não apaga a linha; mesma extensão do `PrismaService` usada no resto do projeto)                 |

A listagem usa paginação por cursor: `pageToken` é o `id` do último item da página anterior, codificado em base64. Quando a página retornada tem exatamente `pageSize` itens, a resposta inclui um novo `pageToken` (base64 do `id` do último registro); do contrário `pageToken` vem `null`, indicando fim da listagem. A busca (`/products/search`) segue a mesma lógica, mas o cursor combina `rank,id` (posição no ranking de relevância + desempate por `id`), já que a ordenação é por `ts_rank` e não por `id`.

A coluna `searchVector` (`tsvector`, `Unsupported` no `schema.prisma`) é mantida por uma trigger de banco (`product_tsvector_update_trigger`, ver seção Prisma) que recalcula o vetor a partir de `name` (peso `A`) e `description` (peso `B`) a cada `INSERT`/`UPDATE`. A busca roda via `$queryRaw` (Prisma não modela full-text search declarativamente) selecionando colunas explícitas — `SELECT *` quebraria a deserialização, já que o driver não sabe converter o tipo `tsvector`.

As rotas de carrinho usam o prefixo `/api/v1/cart` e exigem `accessToken` (Bearer). Carrinho é persistido no MongoDB (módulo `cart`), com `_id` UUIDv7 e expiração automática por inatividade (índice TTL).

| Método   | Rota          | Autenticação         | Finalidade                                                                                                    |
| -------- | ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/cart`       | Bearer `accessToken` | Retorna carrinho do usuário, com itens de mesmo `productId` agrupados (quantidade somada) e `total` calculado |
| `POST`   | `/cart`       | Bearer `accessToken` | Adiciona item ao carrinho (cria o carrinho se não existir)                                                    |
| `DELETE` | `/cart`       | Bearer `accessToken` | Subtrai quantidade de um item; remove o item se a quantidade chegar a zero ou menos                           |
| `GET`    | `/cart/clear` | Bearer `accessToken` | Esvazia o carrinho do usuário                                                                                 |

A documentação interativa (Swagger) fica disponível em `/docs` com a aplicação em execução.

Esses fluxos ainda fazem parte do exercício e serão refinados conforme o projeto avançar.

## Circuit breaker

`@UseCircuitBrake(options)` (`src/shared/decorators/circuit-braker.decorator.ts`) protege um método de service que chama um serviço externo, usando `opossum`. Existe um breaker por `Classe.método`, criado na primeira chamada e guardado num registry em memória.

Estados:

| Estado      | Comportamento                                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOSED`    | Chamadas passam. Sucessos e falhas são contados numa janela deslizante (`rollingCountTimeout`, default 10s)                                                                         |
| `OPEN`      | Abre quando há ao menos `volumeThreshold` chamadas na janela e o percentual de erro atinge `errorThresholdPercentage`. Nenhuma chamada chega ao serviço; a resposta vem do fallback |
| `HALF-OPEN` | Após `resetTimeout`, a próxima chamada é uma prova: sucesso fecha o breaker (`CLOSED`), falha reabre (`OPEN`)                                                                       |

Opções (defaults do decorator: `timeout` 5000 ms, `errorThresholdPercentage` 50, `resetTimeout` 10000 ms; qualquer opção do `opossum` também é aceita):

- `fallback`: nome de um método da própria instância (ex.: `'_fallbackProcessing'`, pode ser `private`). Recebe os mesmos argumentos do método protegido, mais o erro como último argumento. Com `fallback` configurado, o `opossum` não lança erro: devolve o retorno do fallback tanto em falha real quanto com o breaker aberto.

A instância do service é passada como primeiro argumento de `breaker.fire`, porque o breaker é único por método e precisa executar o método original e o fallback com o `this` correto. Os eventos `open`, `halfOpen` e `close` são logados (🔴 🟡 🟢).

Exemplo em `BanksService`:

```ts
@UseCircuitBrake({
    timeout: 3000,
    errorThresholdPercentage: 50,
    volumeThreshold: 5,
    resetTimeout: 5000,
    fallback: '_fallbackProcessing',
})
public async callGateway(status: number): Promise<number> {
    const res = await axios.get(`https://httpbin.org/status/${status}`);
    return res.status;
}
```

`GET /banks/test-ciruit-breaker` chama `testCircuitBraker`, que percorre os estágios usando `https://httpbin.org/status/{código}`: 3 chamadas com `200` (`CLOSED`), 6 com `500` até o breaker abrir, 3 chamadas com breaker `OPEN`, espera de 5,5 s (`HALF-OPEN`), 1 chamada de prova com `200` (fecha) e 2 chamadas finais com o breaker `CLOSED` novamente. Acompanhe os logs do servidor para ver as transições.

## Prisma

O schema fica dividido por domínio em `prisma/schema/` (`user.prisma`, `bank.prisma`, `ledger.prisma`, `balance.prisma`, `session.prisma`, `products.prisma`), mais `schema.prisma` com o bloco `generator`/`datasource` — o Prisma CLI funde todos os arquivos da pasta automaticamente. Configuração de conexão e caminho do schema fica em `prisma7.config.ts`, que monta a connection string a partir das mesmas `POSTGRES_*` vars usadas pelo `PrismaService` em runtime (ver seção Configuração).

O model `Products` tem `slug` com constraint `@unique` (identificador amigável, alternativo ao `id`) e `createdAt` com `@default(now())` — diferença em relação à maioria dos outros models do projeto, que preenchem `createdAt` manualmente na aplicação.

```bash
# gerar o Prisma Client a partir do schema
npx prisma generate

# sincronizar o schema direto no banco de dev (sem gerar arquivo de migration)
npx prisma db push

# criar e aplicar uma migration versionada
npx prisma migrate dev --name <nome>

# aplicar migrations pendentes (ambientes não interativos)
npx prisma migrate deploy

# conferir estado das migrations
npx prisma migrate status
```

Mudanças de schema seguem via `migrate dev`, e `npx prisma migrate status` confirma o banco sincronizado com o histórico de migrations.

### Seed

```bash
npx prisma db seed
```

Popula a tabela `banks` com as principais instituições financeiras do Brasil (`prisma/seeds/banks.seed.sql`, executado por `prisma/seed.ts` via `pg`). Idempotente (`WHERE NOT EXISTS` por `tax_id`, já que a tabela não tem constraint de unicidade nessa coluna) — pode rodar mais de uma vez sem duplicar. O comando também dispara automaticamente depois de `npx prisma migrate dev`. ISPB/CNPJ/COMPE dessa seed valem como dado de estudo; confira contra a lista oficial do Bacen antes de usar em produção.

Também popula a tabela `products` com 2040 produtos fictícios (jogos retro, nomes e descrições em português) — `prisma/seeds/products.seed.ts`, gerado programaticamente combinando 51 jogos clássicos (NES, SNES, Mega Drive, Master System, Atari 2600, Game Boy, PlayStation, Nintendo 64) com condição, região e edição (5 × 4 × 2 = 40 variações por jogo), e inserido em lotes via `pg`. `name`/`slug` incorporam as quatro dimensões (jogo, condição, edição, região), garantindo unicidade nas 2040 combinações — necessário porque `slug` tem constraint `@unique` no schema. Não é idempotente: rodar o seed de novo tenta reinserir os mesmos `slug`s e falha por violação de unicidade; truncar a tabela antes (`TRUNCATE TABLE products;`) se precisar popular de novo.

## Testes

```bash
# testes unitários
yarn test

# testes em modo watch
yarn test:watch

# cobertura de testes
yarn test:cov

# testes end-to-end
yarn test:e2e
```

Cobertura por módulo:

- `auth`, `banks` e `clock`: testes unitários de controllers, services, guards e strategies.
- `budget`: `budget.service` (facade), `balance.service` e `ledger.service` cobertos; controller e `IdempotencyInterceptor` sem testes.
- `shared/decorators`: spec do `is-tax-id` em `tests/`.
- `cart` e `products`: pastas `tests/` vazias.
- End-to-end: só o módulo `banks` (`banks.e2e-spec.ts`).

Todos os `it` estão em inglês; nomes de `describe` e mensagens de negócio (exceptions, DTOs) seguem em português.

## Base de conhecimento e skills (IA)

- `knowledge.md` (raiz): documento de referência sobre o projeto (arquitetura por módulo, padrões de código, convenções de naming, stack técnico, aliases de import etc.) usado como contexto para agentes de IA trabalharem no repositório.
- `skills/`: diretório de skills reutilizáveis por agentes de IA. Contém `nest-controller-generator.skill.md`, que automatiza a criação de controllers seguindo os padrões descritos em `knowledge.md`.

## Próximos passos

- Terminar os testes do módulo `budget` (controller e `IdempotencyInterceptor`) e do `RedisService` — hoje sem cobertura nenhuma.
- Adicionar testes end-to-end para os fluxos de autenticação e budget (`banks` já tem).
- Estudar observabilidade e tratamento global de erros.
- Adicionar um detector de anomalias comportamentais anti-fraude
- Adicionar um rate limit por segurança
- Adicionar um conciliador de saldos (real-time) que dispara um alert para o backoffice em caso de discrepância.
- Adicionar testes pro módulo `cart` (controller, service, repository) — hoje sem cobertura nenhuma.
- Adicionar testes pro decorator `@UseCircuitBrake`.

## Observação

Este não pretende ser um template pronto para produção. É um laboratório pessoal para recuperar ritmo, testar abordagens e registrar a evolução do meu estudo de backend com NestJS. Já que estou há uns 5 anos sem pegar algo denso para mexer 😜.
