import mongoose from 'mongoose';
import { uuidv7 } from 'uuidv7';
import { slugfy } from '../../src/shared/utils/functions';
import {
    ProductsSchema,
    IProduct,
} from '../../src/database/mongodb/schemas';
import { ProductStatus } from '../../src/database/mongodb/schemas/products.schema';
import { CLASSIC_GAMES, ClassicGame } from '../data/classic-games';

const TOTAL_PRODUCTS = 2000;

const CONDITIONS = [
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

const STATUS_CYCLE = [ProductStatus.IN_STOCK, ProductStatus.OUT_STOCK];

interface ProductRow {
    name: string;
    slug: string;
    description: string;
    price: number;
    status: ProductStatus;
    createdAt: Date;
}

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

    for (const game of CLASSIC_GAMES) {
        for (const condition of CONDITIONS) {
            for (const region of REGIONS) {
                for (const edition of EDITIONS) {
                    if (products.length === TOTAL_PRODUCTS) return products;

                    const index = products.length;
                    const editionBonus =
                        edition === 'Edição Colecionador' ? 8000 : 0;
                    const name = `${game.title} — ${condition.label} — ${edition} — ${region}`;

                    products.push({
                        name,
                        slug: slugfy(name),
                        description: buildDescription(
                            game,
                            condition.label,
                            region,
                            edition,
                        ),
                        price: Math.round(
                            PLATFORM_BASE_PRICE_CENTS[game.platform] *
                                condition.multiplier +
                                editionBonus,
                        ),
                        status: STATUS_CYCLE[index % STATUS_CYCLE.length],
                        createdAt: new Date(now - index * 3_600_000),
                    });
                }
            }
        }
    }

    return products;
}

export async function seedMongoProducts(
    connection: mongoose.Connection,
): Promise<number> {
    const Products = connection.model<IProduct>('Products', ProductsSchema);
    const products = generateProducts();

    // Idempotente: só insere slugs que ainda não existem.
    const result = await Products.bulkWrite(
        products.map(({ slug, ...rest }) => ({
            updateOne: {
                filter: { slug },
                update: {
                    $setOnInsert: {
                        _id: new mongoose.Types.UUID(uuidv7()),
                        slug,
                        ...rest,
                    },
                },
                upsert: true,
            },
        })),
        { ordered: false },
    );

    return result.upsertedCount;
}
