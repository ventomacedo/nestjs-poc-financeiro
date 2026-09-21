import { slugfy } from '../../src/shared/utils/functions';
import { uuidv7 } from 'uuidv7';
import { Client } from 'pg';
import * as argon2 from 'argon2';
import { CLASSIC_GAMES, ClassicGame } from '../data/classic-games';

type PostStatus = 'PUBLISHED' | 'DRAFT';

interface PostRow {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    authorId: string;
    status: PostStatus;
    createdAt: Date;
}


interface PostAngle {
    title: (game: ClassicGame) => string;
    excerpt: (game: ClassicGame) => string;
    paragraphs: (game: ClassicGame) => string[];
}

const ANGLES: PostAngle[] = [
    {
        title: (g) => `Review: ${g.title} ainda vale a pena em ${g.platform}?`,
        excerpt: (g) =>
            `Jogamos ${g.title} novamente e avaliamos como o clássico de ${g.genre} lançado em ${g.year} envelheceu.`,
        paragraphs: (g) => [
            `${g.title} chegou ao ${g.platform} em ${g.year} e se tornou referência no gênero ${g.genre.toLowerCase()}.`,
            `Revisitar o jogo hoje mostra o que funcionou: controles diretos, ritmo bem medido e uma identidade visual que resiste ao tempo.`,
            `Nem tudo envelheceu bem, mas a experiência continua sendo uma ótima porta de entrada para quem quer conhecer a era ${g.year}.`,
        ],
    },
    {
        title: (g) => `10 curiosidades sobre ${g.title}`,
        excerpt: (g) =>
            `Bastidores, segredos e histórias pouco conhecidas sobre ${g.title}, do ${g.platform}.`,
        paragraphs: (g) => [
            `Poucos jogadores sabem como ${g.title} foi desenvolvido para o ${g.platform} em ${g.year}.`,
            `Equipes pequenas, prazos apertados e muita criatividade moldaram um título de ${g.genre.toLowerCase()} que ainda é lembrado.`,
            `Confira detalhes que passaram batido na época e que fazem o jogo ficar ainda mais interessante.`,
        ],
    },
    {
        title: (g) => `Guia para iniciantes: como jogar ${g.title}`,
        excerpt: (g) =>
            `Dicas essenciais para quem está começando ${g.title} e quer chegar mais longe sem perder vidas à toa.`,
        paragraphs: (g) => [
            `${g.title} não perdoa quem ignora o básico. Entender as regras do ${g.genre.toLowerCase()} clássico é o primeiro passo.`,
            `Comece explorando as fases iniciais com calma, memorize padrões e aprenda a usar cada recurso disponível.`,
            `Com um pouco de prática, o jogo de ${g.year} deixa de ser um desafio impossível e vira pura diversão.`,
        ],
    },
    {
        title: (g) => `Como colecionar ${g.title} para ${g.platform}`,
        excerpt: (g) =>
            `Versões, preços e cuidados na hora de comprar uma cópia original de ${g.title}.`,
        paragraphs: (g) => [
            `Colecionar ${g.title} exige atenção: existem versões nacionais, americanas, japonesas e europeias para o ${g.platform}.`,
            `Confira a etiqueta, o estado da placa e a caixa antes de fechar negócio, e desconfie de preços muito abaixo do mercado.`,
            `Cópias completas, com caixa e manual, tendem a se valorizar com o passar dos anos.`,
        ],
    },
    {
        title: (g) => `${g.title} e o legado do ${g.platform}`,
        excerpt: (g) =>
            `Como ${g.title} ajudou a definir o que conhecemos hoje como jogos de ${g.genre.toLowerCase()}.`,
        paragraphs: (g) => [
            `Lançado em ${g.year}, ${g.title} deixou marcas profundas no ${g.platform} e na indústria.`,
            `Suas ideias foram copiadas, refinadas e reinterpretadas por gerações de desenvolvedores.`,
            `Entender esse legado ajuda a enxergar de onde vêm muitas das mecânicas atuais.`,
        ],
    },
    {
        title: (g) => `Speedrun de ${g.title}: técnicas e recordes`,
        excerpt: (g) =>
            `Conheça as rotas, glitches e estratégias usadas pela comunidade para zerar ${g.title} no menor tempo possível.`,
        paragraphs: (g) => [
            `A comunidade de speedrun transformou ${g.title} em um playground de otimização no ${g.platform}.`,
            `Rotas milimétricas, manipulação de sorte e domínio total dos controles separam jogadores casuais dos recordistas.`,
            `Se você curte o gênero ${g.genre.toLowerCase()}, vale acompanhar as corridas e aprender com os melhores.`,
        ],
    },
    {
        title: (g) => `Trilha sonora de ${g.title}: memórias em 8 e 16 bits`,
        excerpt: (g) =>
            `Um passeio pelas músicas que marcaram ${g.title} e ajudaram a criar a atmosfera do jogo.`,
        paragraphs: (g) => [
            `Mesmo com os limites de áudio do ${g.platform}, ${g.title} conseguiu entregar temas inesquecíveis.`,
            `As melodias curtas e repetitivas grudam na cabeça e reforçam o clima do jogo de ${g.genre.toLowerCase()}.`,
            `Ouvir essas faixas hoje é uma viagem direta a ${g.year}.`,
        ],
    },
    {
        title: (g) => `Por que ${g.title} marcou uma geração`,
        excerpt: (g) =>
            `Relatos de quem jogou ${g.title} no ${g.platform} e o que o jogo significa até hoje.`,
        paragraphs: (g) => [
            `Para muita gente, ${g.title} foi o primeiro contato com videogames.`,
            `As tardes na frente da TV, os cartuchos emprestados e as dicas trocadas na escola fazem parte da memória afetiva do ${g.platform}.`,
            `Décadas depois de ${g.year}, o jogo continua despertando nostalgia.`,
        ],
    },
];

const STATUS_CYCLE: PostStatus[] = ['PUBLISHED', 'PUBLISHED', 'DRAFT'];

export function generatePosts(authorId: string): PostRow[] {
    const posts: PostRow[] = [];
    const now = Date.now();
    let index = 0;

    for (const game of CLASSIC_GAMES) {
        for (const angle of ANGLES) {
            const title = angle.title(game);

            posts.push({
                id: uuidv7(),
                title,
                slug: slugfy(title),
                excerpt: angle.excerpt(game),
                content: angle.paragraphs(game).join('\n\n'),
                authorId,
                status: STATUS_CYCLE[index % STATUS_CYCLE.length],
                createdAt: new Date(now - index * 3_600_000),
            });

            index += 1;
        }
    }

    return posts;
}

const COLUMNS = [
    'id',
    'title',
    'slug',
    'excerpt',
    'content',
    'user_id',
    'status',
    'created_at',
] as const;

const BATCH_SIZE = 250;

const SEED_AUTHOR_EMAIL = 'seed.author@example.com';

async function ensureAuthor(client: Client): Promise<string> {
    const existing = await client.query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [SEED_AUTHOR_EMAIL],
    );
    if (existing.rows[0]) return existing.rows[0].id;

    const password = await argon2.hash(uuidv7(), { type: argon2.argon2id });
    const created = await client.query<{ id: string }>(
        `INSERT INTO users (email, password, is_two_factor_enabled, is_first_access)
         VALUES ($1, $2, false, false) RETURNING id`,
        [SEED_AUTHOR_EMAIL, password],
    );
    return created.rows[0].id;
}

export async function seedPosts(client: Client): Promise<number> {
    const authorId = await ensureAuthor(client);
    const posts = generatePosts(authorId);
    let inserted = 0;

    for (let start = 0; start < posts.length; start += BATCH_SIZE) {
        const batch = posts.slice(start, start + BATCH_SIZE);
        const values: unknown[] = [];
        const rows = batch.map((post, rowIndex) => {
            const base = rowIndex * COLUMNS.length;
            values.push(
                post.id,
                post.title,
                post.slug,
                post.excerpt,
                post.content,
                post.authorId,
                post.status,
                post.createdAt,
            );
            return `(${COLUMNS.map((_, colIndex) => `$${base + colIndex + 1}`).join(', ')})`;
        });

        const result = await client.query(
            `INSERT INTO posts (${COLUMNS.join(', ')}) VALUES ${rows.join(', ')} ON CONFLICT (slug) DO NOTHING`,
            values,
        );
        inserted += result.rowCount ?? 0;
    }

    return inserted;
}
