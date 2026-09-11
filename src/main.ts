import './register-paths';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'shared/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');
    // app.enableCors();

    // Swagger Document
    const config = new DocumentBuilder()
        .setTitle('Nest Playground API')
        .setDescription(
            'Uma API para relembrar alguns conceitos e usos no NESTJS',
        )
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
    Logger.log('🚀 Servidor iniciado na porta 3000');
}

process.on('SIGTERM', async () => {
    Logger.log('SIGTERM recebido - encerrando gracefully...');
    process.exit(0);
});

bootstrap();
