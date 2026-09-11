# Knowledge Document - Rafael's NestJS POC Financeiro

## Visão Geral do Projeto

- **Framework**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Cache/Locks**: Redis (para idempotência)
- **Autenticação**: JWT + 2FA (TOTP)
- **Objetivo**: Aplicação financeira com estudo de padrões backend

---

## 📁 Estrutura de Pastas

```
src/
├── modules/                    # Módulos de domínio isolados
│   ├── auth/                  # Autenticação + 2FA
│   ├── banks/                 # Instituições financeiras
│   ├── clock/                 # Exemplo de SSE
│   └── budget/                # Experimento: idempotência + ledger/balance
├── database/                  # Camada de dados (Prisma)
├── shared/                    # Código compartilhado
│   ├── decorators/
│   ├── filters/
│   ├── redis/
│   └── utils/
├── app.module.ts
├── app.controller.ts
└── main.ts

prisma/
├── schema/                    # Schema dividido por domínio
│   ├── schema.prisma
│   ├── user.prisma
│   ├── bank.prisma
│   ├── ledger.prisma
│   ├── balance.prisma
│   └── session.prisma
├── migrations/
├── seeds/
│   └── banks.seed.sql
└── seed.ts
```

---

## 🏗️ Arquitetura por Módulo

### Padrão Geral (Auth, Banks, Clock)

```
módulo/
├── dto/                       # Data Transfer Objects (DTO)
├── guards/                    # Guards de autorização
├── strategies/                # Estratégias Passport (apenas Auth)
├── tests/                     # Testes unitários
├── [modulo].controller.ts    # Recebe request, delega pro service
├── [modulo].service.ts       # Lógica de negócio
├── [modulo].module.ts        # Definição do módulo
└── index.ts                  # Barrel export (só o que outros módulos precisam)
```

### Padrão do Budget (Mais Complexo)

```
budget/
├── dto/
├── types/                     # Tipos Typescript (enums, interfaces)
├── repository/               # Padrão Repository (interface + impl Prisma)
│   ├── balance.repository.ts
│   ├── ledger.repository.ts
│   └── index.ts
├── tests/
├── budget.controller.ts
├── budget.service.ts         # Facade (orquestra balance + ledger)
├── balance.service.ts        # Serviço específico
├── ledger.service.ts         # Serviço específico
├── idempotency.interceptor.ts # Interceptor de idempotência (Redis)
├── budget.module.ts
└── index.ts
```

---

## 🎯 Padrões de Código

### Controllers

- Recebem request via decoradores (`@Body()`, `@Param()`, etc)
- **Delegam toda lógica para service**
- Retornam response formatado ou atiram erro
- Responsáveis por parsing de URL/query params
- Responsáveis por chamar service e retornar DTO

**Exemplo (conceitual)**:

```typescript
@Controller('banks')
export class BanksController {
    constructor(private readonly banksService: BanksService) {}

    @Get()
    async findAll() {
        return await this.banksService.findAll();
    }

    @Post()
    async create(@Body() dto: CreateBankDto) {
        return await this.banksService.create(dto);
    }
}
```

### Services

- **Contêm toda lógica de negócio**
- Chamam repositories para acesso a dados
- Jogam exceções descritivas (`BadRequestException`, `NotFoundException`, etc)
- Podem usar @Inject pra depender de outros services
- Métodos assíncronos

**Exemplo (conceitual)**:

```typescript
@Injectable()
export class BanksService {
    constructor(private readonly banksRepository: BanksRepository) {}

    async create(dto: CreateBankDto) {
        const exists = await this.banksRepository.findByTaxId(dto.taxId);
        if (exists) throw new BadRequestException('Bank already exists');
        return this.banksRepository.create(dto);
    }
}
```

### Repositories (Pattern)

- **Interface + Implementação Prisma**
- Só chamadas ao banco de dados
- Retornam dados brutos (sem DTOs)
- Injetadas via token de provider customizado

**Exemplo (interface conceitual)**:

```typescript
export interface IRepository<T> {
    create(data: T): Promise<T>;
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
}

@Injectable()
export class BanksRepository implements IBanksRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateBankDto) {
        return this.prisma.bank.create({ data });
    }
}
```

### DTOs (Data Transfer Objects)

- Usam `class-validator` e `class-transformer`
- Validação via decoradores (`@IsEmail()`, `@IsUUID()`, etc)
- Definidas em `dto/` do módulo
- Separadas: `Create*Dto`, `Update*Dto`, `Response*Dto`

**Exemplo (conceitual)**:

```typescript
export class CreateBankDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @Length(14, 14)
    taxId: string;
}
```

### Módulos

- Importam outros módulos que precisam
- Declaram controllers, providers, exports
- Exports via barrel (`index.ts`)

---

## 🔐 Segurança

### Autenticação (JWT + 2FA/TOTP)

1. **Sign-in** (`/auth/signin`): Retorna `twoFactorAuthToken` (temp, tipo PRE_AUTH)
2. **Sync TOTP** (`/auth/sync-app-authenticator`): Gera QR Code
3. **Verify 2FA** (`/auth/verify-two-factor-authentication`): Valida TOTP, retorna `accessToken` (tipo FULL_AUTH)
4. **Sign-out** (`/auth/signout`): Revoga sessão no banco (marca `revokedAt`)

**Secrets**:

- `JWT_SECRET`: Assinatura dos JWTs
- `PEPPER_SECRET`: Concatenado à senha antes do hash (argon2id)
- `TWO_FACTOR_SECRET_KEY`: Criptografa segredo TOTP em repouso (AES-256-GCM)

### Session

- Tabela `Session` vinculada a `User` e ao `accessToken` (JWT)
- `JwtStrategy` valida contra tabela a cada requisição (não só assinatura)
- Permite revogar antes da expiração natural

---

## 🗄️ Banco de Dados (Prisma)

### Organização

- **schema** dividido por domínio em `prisma/schema/`
- Cada tabela de domínio tem seu arquivo (`.prisma`)
- Prisma CLI funde automaticamente

### Comandos

```bash
# Gerar Prisma Client
npx prisma generate

# Sincronizar schema direto (dev)
npx prisma db push

# Criar migration
npx prisma migrate dev --name <nome>

# Aplicar migrations (prod/CI)
npx prisma migrate deploy

# Status das migrations
npx prisma migrate status

# Seed (popula dados)
npx prisma db seed
```

### Padrão de Migrations

- Mudanças menores: `db push`
- Mudanças importantes: `migrate dev` (cria arquivo versionado)
- Sempre `migrate deploy` em prod

---

## 📊 Padrões Específicos

### Idempotência (Budget/Ledger)

- `IdempotencyInterceptor` em rotas de escrita
- Redis lock por `transactionId`
- TTL configurable (retorna resposta anterior se chamada duplicada)

### Ledger/Balance Versionado

- `Balance`: chave composta `userId + version` (sem `id` próprio)
- `Ledger`: registra cada lançamento (RESERVED, REFUNDED, WITHDRAW, CREDITED)
- Cada mudança em `Ledger` vira nova versão de `Balance`

### SSE (Server-Sent Events)

- `/clock/stream`: Emite timestamp a cada segundo
- `/budget/balance/stream`: Poll em `Ledger` com outbox pattern (cursor `publishedAt`)
- At-least-once delivery via `Ledger` como fila

---

## 🛠️ Stack Técnico

### Core

- Node.js (v18+)
- TypeScript
- NestJS

### Banco

- PostgreSQL
- Prisma ORM (com adapter `@prisma/adapter-pg`)
- Redis (locks, cache)

### Segurança

- JWT + Passport
- argon2id (hash de senha)
- AES-256-GCM (simétrica reversível)
- otplib + qrcode (2FA/TOTP)

### Data/Utils

- `date-fns` e `@date-fns/tz`
- `class-validator` e `class-transformer` (DTOs)

### Testing

- Jest (unitários)
- Supertest (E2E)
- Testcontainers (opcional)

### DevOps

- Docker + Docker Compose
- Multi-stage build
- GitHub Actions (CI/CD)

---

## 📋 Aliases de Import (tsconfig.json)

```json
"paths": {
  "@auth/*": ["src/modules/auth/*"],
  "@banks/*": ["src/modules/banks/*"],
  "@clock/*": ["src/modules/clock/*"],
  "@budget/*": ["src/modules/budget/*"],
  "@database/*": ["src/database/*"],
  "@shared/decorators/*": ["src/shared/decorators/*"],
  "@shared/filters/*": ["src/shared/filters/*"],
  "@shared/redis/*": ["src/shared/redis/*"],
  "@shared/utils/*": ["src/shared/utils/*"],
  "@prisma": ["src/database/prisma.service"]
}
```

Usados por:

- Jest (`jest.config.ts` via `pathsToModuleNameMapper` do `ts-jest`)
- Runtime compilado (`src/register-paths.ts` via `tsconfig-paths`)

---

## 🎯 Naming Conventions

| Tipo            | Convenção             | Exemplo                          |
| --------------- | --------------------- | -------------------------------- |
| Classes         | PascalCase            | `UserController`, `BanksService` |
| Funções/Métodos | camelCase             | `findById()`, `createUser()`     |
| Constantes      | UPPER_SNAKE_CASE      | `JWT_EXPIRATION_TIME`            |
| Arquivos        | kebab-case            | `banks.controller.ts`            |
| DTOs            | `[Ação][Entidade]Dto` | `CreateBankDto`, `UpdateUserDto` |
| Enums           | PascalCase            | `LedgerType`, `UserRole`         |

---

## ⚡ Configuração de Ambiente

```bash
# .env
APP_NAME=EstudoNest
PORT=3000
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/postgres
JWT_SECRET=uma-chave-forte-aqui
REDIS_HOST=localhost
REDIS_PORT=6379
TWO_FACTOR_SECRET_KEY=32-bytes-base64-encoded
PEPPER_SECRET=concatena-à-senha
LOG_LEVEL=info
```

---

## 🧪 Testes

```bash
yarn test                # Unitários
yarn test:watch        # Watch mode
yarn test:cov          # Cobertura
yarn test:e2e          # End-to-end
```

**Padrão**:

- Testes unitários por módulo
- E2E nos módulos principais
- Fixtures + mocks para depências externas (DB, Redis, etc)

---

## 🚀 Próximas Evoluções

- [ ] Cobertura completa do budget (interceptor + E2E)
- [ ] Observabilidade (Winston logger)
- [ ] Rate limiting
- [ ] Detector de anomalias anti-fraude
- [ ] Conciliador de saldos (real-time com alerts)

---

## 📝 Notas Importantes

1. **Cada módulo é independente**: Usa `index.ts` (barrel) pra expor só o necessário
2. **Injeção de Dependências**: NestJS resolve automaticamente
3. **Validação**: Usa decoradores do `class-validator` nos DTOs
4. **Erros**: Lança exceções HTTP nativas do NestJS
5. **Async/Await**: Tudo é Promise-based
6. **Prisma**: Mantém com imports via aliases (`@prisma`)

---

## 🔗 Exemplo de Fluxo Request → Response

```
GET /api/v1/banks/123
    ↓
BanksController.findById(123)
    ↓
BanksService.findById(123)
    ↓
BanksRepository.findById(123)
    ↓
prisma.bank.findUnique({ where: { id: 123 } })
    ↓
Return { id, name, taxId, ... }
    ↓
Controller retorna DTO
    ↓
HTTP 200 + JSON
```

---

**Gerado em**: Setembro 2026 | **Versão**: 1.0
