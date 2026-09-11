# SKILL: NestJS Controller Generator

## Meta

Automatizar a criação de Controllers NestJS seguindo os padrões do projeto.

## Quando Ativar

Usuario pede:

- "Crie um controller para..."
- "Gere um controller de..."
- "Faça um controller que..."
- "Crie um endpoint para..."

## Pré-requisitos

- Ter `knowledge.md` do projeto disponível
- Usuario fornecendo: domínio da feature (ex: "notifications", "payments")

## Processo (Step-by-Step)

### Etapa 1: Clarificar Requisitos

Pergunte (se não óbvio):

```
- Que domínio? (ex: notifications)
- Que operações? (CRUD? Custom?)
- Precisa de autenticação?
- Retorna que tipo de dado?
```

### Etapa 2: Montar Estrutura Base

Baseado no conhecimento (knowledge.md), gere:

```typescript
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { [Dominio]Service } from './[dominio].service';
import { Create[Dominio]Dto } from './dto/create-[dominio].dto';

@Controller('api/v1/[dominio-plural]')
export class [DominioCapital]Controller {
  constructor(private readonly [dominio]Service: [Dominio]Service) {}

  @Get()
  async findAll() {
    return await this.[dominio]Service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.[dominio]Service.findById(id);
  }

  @Post()
  async create(@Body() dto: Create[Dominio]Dto) {
    return await this.[dominio]Service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Create[Dominio]Dto) {
    return await this.[dominio]Service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.[dominio]Service.delete(id);
  }
}
```

### Etapa 3: Adicionar Decoradores do Projeto

Se o projeto tem:

- `@Auth()` → adicionar em rotas que precisam autenticação
- `@User()` → injetar usuário logado
- `@RateLimit()` → adicionar se tem rate limit

Exemplo (para projeto com auth):

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { User } from '@shared/decorators/user.decorator';

@Controller('api/v1/[dominio-plural]')
@UseGuards(JwtAuthGuard)
export class [DominioCapital]Controller {
  @Get()
  async findAll(@User() user: any) {
    return await this.[dominio]Service.findAll(user.id);
  }
  // ...
}
```

### Etapa 4: Retornar Completo

Gere também:

1. **DTO** (Create/Update com validadores)
2. **Service** (stub com comentários)
3. **Module** (configuração)

## Padrões que NUNCA Quebrar

✅ **SEMPRE faça:**

- [ ] Controller com decoradores @Controller, @Get, @Post, @Put, @Delete
- [ ] Métodos async/await (promises)
- [ ] DTOs com class-validator decorators (@IsString, @IsNotEmpty, etc)
- [ ] Injetar Service via constructor
- [ ] Mensagens de erro em português
- [ ] Usar aliases de import (@shared, @auth, etc)
- [ ] Arquivo com naming kebab-case (ex: notifications.controller.ts)
- [ ] Classe em PascalCase (ex: NotificationsController)
- [ ] Exportar via barrel index.ts

❌ **NUNCA faça:**

- [ ] Lógica de negócio no controller (só delegação pro service)
- [ ] Query raw SQL (sempre usar repository/Prisma)
- [ ] Erros sem tipo (sempre BadRequestException, NotFoundException, etc)
- [ ] Endpoints sem versão de API (/api/v1/)
- [ ] DTOs sem validação
- [ ] Métodos síncronos

## Exemplo de Output Completo

### notifications.controller.ts

```typescript
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { User } from '@shared/decorators/user.decorator';

@Controller('/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get('/')
    async findAll(@User() user: any) {
        return await this.notificationsService.findAll(user.id);
    }

    @Get('/:id')
    async findById(@Param('id') id: string, @User() user: any) {
        return await this.notificationsService.findById(id, user.id);
    }

    @Post('/')
    async create(@Body() dto: CreateNotificationDto, @User() user: any) {
        return await this.notificationsService.create(dto, user.id);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string, @User() user: any) {
        return await this.notificationsService.delete(id, user.id);
    }
}
```

### dto/create-notification.dto.ts

```typescript
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    message?: string;

    @IsString()
    @IsNotEmpty()
    type: 'EMAIL' | 'SMS' | 'PUSH';
}
```

### notifications.service.ts

```typescript
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsRepository } from './repository/notifications.repository';

@Injectable()
export class NotificationsService {
    constructor(private readonly repository: NotificationsRepository) {}

    async findAll(userId: string) {
        // TODO: Buscar notificações do usuário
        return [];
    }

    async findById(id: string, userId: string) {
        // TODO: Validar ownership e retornar
        return {};
    }

    async create(dto: CreateNotificationDto, userId: string) {
        // TODO: Criar notificação
        return {};
    }

    async delete(id: string, userId: string) {
        // TODO: Deletar notificação
        return { success: true };
    }
}
```

### notifications.module.ts

```typescript
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repository/notifications.repository';

@Module({
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsRepository],
    exports: [NotificationsService],
})
export class NotificationsModule {}
```

### index.ts (Barrel)

```typescript
export * from './notifications.controller';
export * from './notifications.service';
export * from './notifications.module';
```

## Checklist Final

Antes de retornar o código, valide:

- [ ] Estrutura de pastas correta?
- [ ] Naming (kebab-case files, PascalCase classes)?
- [ ] Todos os DTOs com validadores?
- [ ] Service está injetado corretamente?
- [ ] Guard/Auth decoradores presentes?
- [ ] Todos os arquivos têm alias imports?
- [ ] Barrel index.ts exportando certo?
- [ ] Mensagens em português?
- [ ] Métodos async/await?

## Como Usar Esta Skill

### Invocação Simples

```
Crie um controller para notificações com CRUD completo
```

### Invocação com Detalhes

```
Crie um controller notifications que:
- Liste notificações do usuário autenticado
- Permita criar, atualizar, deletar
- Cada notificação tem: title, message, type (EMAIL/SMS/PUSH)
- Endpoint base: /api/v1/notifications
```

### Resposta Esperada

Claude retorna:

1. Controller completo
2. DTO com validadores
3. Service (stub)
4. Module
5. Barrel index.ts

---

## Notas Importantes

- Esta skill assume que `knowledge.md` do projeto está disponível
- Se projeto tem patterns especiais (ex: outbox, idempotência), adapt conforme
- Sempre pergunte se não tiver certeza (melhor que gerar errado)
- Se controller é complexo (many-to-many), ofereça criar service helper também

---

**Versão:** 1.0 | **Criado:** Setembro 2026 | **Para:** Projetos NestJS com padrões modernos
