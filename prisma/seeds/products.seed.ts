import { slugfy } from './../../src/shared/utils/functions';
import { uuidv7 } from 'uuidv7';
import { Client } from 'pg';

type ProductStatus = 'IN_STOCK' | 'OUT_STOCK' | 'AVAILABLE' | 'UNAVAILABLE';

interface ClassicGame {
    title: string;
    platform: string;
    genre: string;
    year: number;
}

interface ProductRow {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    status: ProductStatus;
    createdAt: Date;
}

const CLASSIC_GAMES: ClassicGame[] = [
    {
        title: 'Super Mario Bros.',
        platform: 'NES',
        genre: 'Plataforma',
        year: 1985,
    },
    {
        title: 'The Legend of Zelda',
        platform: 'NES',
        genre: 'Aventura',
        year: 1986,
    },
    { title: 'Metroid', platform: 'NES', genre: 'Aventura', year: 1986 },
    { title: 'Mega Man 2', platform: 'NES', genre: 'Ação', year: 1988 },
    { title: 'Castlevania', platform: 'NES', genre: 'Ação', year: 1986 },
    { title: 'Contra', platform: 'NES', genre: 'Tiro', year: 1987 },
    { title: 'Duck Hunt', platform: 'NES', genre: 'Tiro', year: 1984 },
    { title: 'Donkey Kong', platform: 'NES', genre: 'Plataforma', year: 1986 },
    { title: 'Galaga', platform: 'NES', genre: 'Tiro', year: 1988 },
    { title: 'Tetris', platform: 'Game Boy', genre: 'Puzzle', year: 1989 },
    {
        title: 'Super Mario Land',
        platform: 'Game Boy',
        genre: 'Plataforma',
        year: 1989,
    },
    {
        title: "Kirby's Dream Land",
        platform: 'Game Boy',
        genre: 'Plataforma',
        year: 1992,
    },
    {
        title: 'Super Mario World',
        platform: 'SNES',
        genre: 'Plataforma',
        year: 1990,
    },
    {
        title: 'The Legend of Zelda: A Link to the Past',
        platform: 'SNES',
        genre: 'Aventura',
        year: 1991,
    },
    { title: 'Super Metroid', platform: 'SNES', genre: 'Aventura', year: 1994 },
    { title: 'Chrono Trigger', platform: 'SNES', genre: 'RPG', year: 1995 },
    { title: 'Final Fantasy VI', platform: 'SNES', genre: 'RPG', year: 1994 },
    { title: 'EarthBound', platform: 'SNES', genre: 'RPG', year: 1994 },
    {
        title: 'Donkey Kong Country',
        platform: 'SNES',
        genre: 'Plataforma',
        year: 1994,
    },
    { title: 'Street Fighter II', platform: 'SNES', genre: 'Luta', year: 1992 },
    {
        title: 'Super Mario Kart',
        platform: 'SNES',
        genre: 'Corrida',
        year: 1992,
    },
    { title: 'F-Zero', platform: 'SNES', genre: 'Corrida', year: 1990 },
    { title: 'Star Fox', platform: 'SNES', genre: 'Tiro', year: 1993 },
    {
        title: 'Sonic the Hedgehog',
        platform: 'Mega Drive',
        genre: 'Plataforma',
        year: 1991,
    },
    {
        title: 'Sonic the Hedgehog 2',
        platform: 'Mega Drive',
        genre: 'Plataforma',
        year: 1992,
    },
    {
        title: 'Streets of Rage 2',
        platform: 'Mega Drive',
        genre: 'Luta',
        year: 1992,
    },
    { title: 'Golden Axe', platform: 'Mega Drive', genre: 'Ação', year: 1989 },
    {
        title: 'Altered Beast',
        platform: 'Mega Drive',
        genre: 'Ação',
        year: 1988,
    },
    {
        title: 'Gunstar Heroes',
        platform: 'Mega Drive',
        genre: 'Tiro',
        year: 1993,
    },
    {
        title: 'ToeJam & Earl',
        platform: 'Mega Drive',
        genre: 'Aventura',
        year: 1991,
    },
    {
        title: 'Phantasy Star IV',
        platform: 'Mega Drive',
        genre: 'RPG',
        year: 1993,
    },
    {
        title: 'Alex Kidd in Miracle World',
        platform: 'Master System',
        genre: 'Plataforma',
        year: 1986,
    },
    {
        title: 'Wonder Boy III',
        platform: 'Master System',
        genre: 'Plataforma',
        year: 1988,
    },
    { title: 'Shinobi', platform: 'Master System', genre: 'Ação', year: 1987 },
    {
        title: 'Pac-Man',
        platform: 'Atari 2600',
        genre: 'Labirinto',
        year: 1982,
    },
    {
        title: 'Space Invaders',
        platform: 'Atari 2600',
        genre: 'Tiro',
        year: 1980,
    },
    { title: 'Frogger', platform: 'Atari 2600', genre: 'Ação', year: 1982 },
    { title: 'Q*bert', platform: 'Atari 2600', genre: 'Puzzle', year: 1983 },
    {
        title: 'Pitfall!',
        platform: 'Atari 2600',
        genre: 'Aventura',
        year: 1982,
    },
    { title: 'River Raid', platform: 'Atari 2600', genre: 'Tiro', year: 1982 },
    {
        title: 'Adventure',
        platform: 'Atari 2600',
        genre: 'Aventura',
        year: 1979,
    },
    {
        title: 'Crash Bandicoot',
        platform: 'PlayStation',
        genre: 'Plataforma',
        year: 1996,
    },
    {
        title: 'Spyro the Dragon',
        platform: 'PlayStation',
        genre: 'Plataforma',
        year: 1998,
    },
    {
        title: 'Final Fantasy VII',
        platform: 'PlayStation',
        genre: 'RPG',
        year: 1997,
    },
    {
        title: 'Metal Gear Solid',
        platform: 'PlayStation',
        genre: 'Ação',
        year: 1998,
    },
    {
        title: 'Resident Evil',
        platform: 'PlayStation',
        genre: 'Terror',
        year: 1996,
    },
    { title: 'Tekken 3', platform: 'PlayStation', genre: 'Luta', year: 1998 },
    {
        title: 'Gran Turismo',
        platform: 'PlayStation',
        genre: 'Corrida',
        year: 1997,
    },
    {
        title: 'Super Mario 64',
        platform: 'Nintendo 64',
        genre: 'Plataforma',
        year: 1996,
    },
    {
        title: 'GoldenEye 007',
        platform: 'Nintendo 64',
        genre: 'Tiro',
        year: 1997,
    },
    {
        title: 'The Legend of Zelda: Ocarina of Time',
        platform: 'Nintendo 64',
        genre: 'Aventura',
        year: 1998,
    },
];

const CONDITIONS: { label: string; multiplier: number }[] = [
    { label: 'Novo (Lacrado)', multiplier: 1.5 },
    { label: 'Usado - Excelente Estado', multiplier: 1.2 },
    { label: 'Usado - Bom Estado', multiplier: 1.0 },
    { label: 'Usado - Com Marcas de Uso', multiplier: 0.7 },
    { label: 'Restaurado', multiplier: 0.9 },
];

const REGIONS = ['Nacional', 'Americano', 'Japonês', 'Europeu'];

const EDITIONS = ['Edição Padrão', 'Edição Colecionador'];

const PLATFORM_BASE_PRICE_CENTS: Record<string, number> = {
    'Atari 2600': 6000,
    NES: 12000,
    'Master System': 10000,
    'Game Boy': 8000,
    SNES: 18000,
    'Mega Drive': 15000,
    PlayStation: 20000,
    'Nintendo 64': 22000,
};

const STATUS_CYCLE: ProductStatus[] = [
    'IN_STOCK',
    'AVAILABLE',
    'OUT_STOCK',
    'UNAVAILABLE',
];

function buildDescription(
    game: ClassicGame,
    condition: string,
    region: string,
    edition: string,
): string {
    const extra =
        edition === 'Edição Colecionador'
            ? 'Inclui item colecionável exclusivo e encarte especial.'
            : 'Peça clássica para colecionadores retro.';

    return `Cópia original de ${game.title}, jogo de ${game.genre} lançado em ${game.year} para ${game.platform}. Versão ${region.toLowerCase()}, estado: ${condition.toLowerCase()}. ${extra}`;
}

export function generateProducts(): ProductRow[] {
    const products: ProductRow[] = [];
    const now = Date.now();
    let index = 0;

    for (const game of CLASSIC_GAMES) {
        for (const condition of CONDITIONS) {
            for (const region of REGIONS) {
                for (const edition of EDITIONS) {
                    const basePrice = PLATFORM_BASE_PRICE_CENTS[game.platform];
                    const editionBonus =
                        edition === 'Edição Colecionador' ? 8000 : 0;
                    const price = Math.round(
                        basePrice * condition.multiplier + editionBonus,
                    );

                    const name = `${game.title} — ${condition.label} — ${edition} — ${region}`;

                    products.push({
                        id: uuidv7(),
                        name,
                        description: buildDescription(
                            game,
                            condition.label,
                            region,
                            edition,
                        ),
                        slug: slugfy(name),
                        price,
                        status: STATUS_CYCLE[index % STATUS_CYCLE.length],
                        createdAt: new Date(now - index * 3_600_000),
                    });

                    index += 1;
                }
            }
        }
    }

    return products;
}

const COLUMNS = [
    'id',
    'name',
    'slug',
    'description',
    'price',
    'status',
    'created_at',
] as const;

const BATCH_SIZE = 250;

export async function seedProducts(client: Client): Promise<number> {
    const products = generateProducts();

    for (let start = 0; start < products.length; start += BATCH_SIZE) {
        const batch = products.slice(start, start + BATCH_SIZE);
        const values: unknown[] = [];
        const rows = batch.map((product, rowIndex) => {
            const base = rowIndex * COLUMNS.length;
            values.push(
                product.id,
                product.name,
                product.slug,
                product.description,
                product.price,
                product.status,
                product.createdAt,
            );
            return `(${COLUMNS.map((_, colIndex) => `$${base + colIndex + 1}`).join(', ')})`;
        });

        await client.query(
            `INSERT INTO products (${COLUMNS.join(', ')}) VALUES ${rows.join(', ')}`,
            values,
        );
    }

    return products.length;
}
