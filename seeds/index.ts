import 'dotenv/config';
import { seedMongo } from './mongo';
import { seedPostgres } from './postgres';

const TARGETS = {
    postgres: seedPostgres,
    mongo: seedMongo,
};

async function main() {
    const target = process.argv[2] ?? 'all';
    const runners =
        target === 'all'
            ? Object.values(TARGETS)
            : [TARGETS[target as keyof typeof TARGETS]];

    if (runners.some((runner) => !runner)) {
        throw new Error(
            `Alvo de seed inválido: "${target}". Use postgres, mongo ou all.`,
        );
    }

    for (const run of runners) await run();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
