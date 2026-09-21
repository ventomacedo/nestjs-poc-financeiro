import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { seedPosts } from './seeds/posts.seed';

async function main() {
    const sql = readFileSync(
        join(__dirname, 'seeds', 'banks.seed.sql'),
        'utf-8',
    );
    const connectionString = `postgresql://${process.env['POSTGRES_USER']}:${process.env['POSTGRES_PASSWORD']}@${process.env['POSTGRES_HOST']}:${process.env['POSTGRES_PORT']}/${process.env['POSTGRES_DB']}`;
    const client = new Client({ connectionString });

    await client.connect();
    try {
        await client.query(sql);
        console.log('Seed de banks aplicado com sucesso.');

        const postsCount = await seedPosts(client);
        console.log(`Seed de posts aplicado com sucesso (${postsCount} registros).`);
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
