import {
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma';
import {
    type IPostsInterface,
    POSTS_REPOSITORY,
    type Posts,
} from './repository/posts.repository';
import { FindPostsResponseDto } from './dto/find-posts-response.dto';
import { SearchPostsRequestDto } from './dto/search-posts-request.dto';
import { SearchPostsResponseDto } from './dto/search-posts-response.dto';
import { CreatePostsRequestDto } from './dto/create-posts-request.dto';
import { slugfy } from '@shared/utils';
import { UpdatePostsRequestDto } from './dto/update-posts-request.dto';
import { postStatusMapping } from './repository/prisma-posts.repository';

@Injectable()
export class PostsService {
    // private logger = new Logger(PostsService.name);

    constructor(
        @Inject(POSTS_REPOSITORY)
        private readonly Posts: IPostsInterface,
    ) {}

    public async find(
        limit: number,
        pageToken?: string,
    ): Promise<FindPostsResponseDto> {
        const cursorId = !!pageToken
            ? Buffer.from(pageToken, 'base64').toString('ascii')
            : undefined;

        const result = await this.Posts.find(limit, cursorId);
        const data = result.map((item) => ({
            ...item,
            displayStatus: postStatusMapping[item.status],
        }));

        let nextPageToken: string | null = null;

        if (data.length === limit) {
            const lastItem = data.at(-1);
            nextPageToken = !!lastItem
                ? Buffer.from(lastItem.id).toString('base64')
                : null;
        }

        // this.logger.debug({ message: `new pageToke: ${nextPageToken}` });
        return { data, pageToken: nextPageToken };
    }

    public async findBySlug(id: string): Promise<Posts | null> {
        return await this.Posts.findBySlug(id);
    }

    public async search(
        dto: SearchPostsRequestDto,
    ): Promise<SearchPostsResponseDto> {
        const { terms, pageToken, pageSize } = dto;
        const _limit = pageSize ?? 10;

        const pageTokenDecoded = pageToken
            ? Buffer.from(pageToken, 'base64').toString('ascii')
            : '';

        const [lastRank, lastId] = pageToken
            ? pageTokenDecoded.split(',')
            : [null, null];

        const data = await this.Posts.search({
            terms,
            pageSize: _limit,
            lastRank: !!lastRank ? Number(lastRank) : undefined,
            lastId: !!lastId ? String(lastId) : undefined,
        });

        let nextToken: string | null = null;
        if (data.length === _limit) {
            const lastItem = data.at(-1);
            nextToken = Buffer.from(`${lastItem.rank},${lastItem.id}`).toString(
                'base64',
            );
        }

        return { data, pageToken: nextToken };
    }

    public async create(data: CreatePostsRequestDto): Promise<Posts | null> {
        const slug = !data.slug ? slugfy(data.title) : data.slug;
        return await this.Posts.create({ ...data, slug });
    }

    public async update(
        id,
        data: UpdatePostsRequestDto,
    ): Promise<Posts | null> {
        try {
            return await this.Posts.update(id, data);
        } catch (error) {
            if (this.isRecordNotFound(error)) {
                throw new NotFoundException(`Post ${id} não encontrado`);
            }
            throw error;
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            await this.Posts.delete(id);
        } catch (error) {
            if (this.isRecordNotFound(error)) {
                throw new NotFoundException(`Post ${id} não encontrado`);
            }
            throw error;
        }
    }

    private isRecordNotFound(error: unknown): boolean {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        );
    }
}
