import { repl } from '@nestjs/core';
import { AppModule } from 'app.module';

async function bootstrapDebug() {
    await repl(AppModule);
}

bootstrapDebug();
