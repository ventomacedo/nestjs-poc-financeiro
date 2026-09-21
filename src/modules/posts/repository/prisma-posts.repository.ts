import { PrismaService } from '@database';
import { IPostsInterface, Posts } from './posts.repository';
import { Injectable } from '@nestjs/common';
import { Prisma, PostStatus as PostStatusEnum } from '@prisma';
import { CreatePostsRequestDto } from '../dto/create-posts-request.dto';

export const postStatusMapping = {
    PUBLISHED: 'Publicado',
    DRAFT: 'Rascunho',
};

@Injectable()
export class PrismaPostsRepository implements IPostsInterface {
    constructor(private readonly db: PrismaService) {}

    public async find(take: number, cursorId: string): Promise<Posts[]> {
        return await this.db.posts.findMany({
            take: take,
            skip: cursorId ? 1 : 0,
            cursor: cursorId ? { id: cursorId } : undefined,
            orderBy: { id: 'asc' },
        });
    }

    public async findBySlug(slug: string): Promise<Posts | null> {
        return await this.db.posts.findUnique({ where: { slug } });
    }

    // FullIndex Text
    public async search({ terms, pageSize, lastRank, lastId }): Promise<any[]> {
        const hasCursor =
            lastRank !== null &&
            lastRank !== undefined &&
            lastId !== null &&
            lastId !== undefined;

        const cursorCondition = hasCursor
            ? Prisma.sql`AND (
                ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) < ${lastRank}
                OR (
                    ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) = ${lastRank}
                    AND id > ${lastId}
                )
            )`
            : Prisma.empty;

        return await this.db.$queryRaw`
            SELECT
                id, title, excerpt, content, status, slug,
                user_id AS "authorId",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt",
                ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) as rank
            FROM posts
                WHERE "searchVector" @@ websearch_to_tsquery('portuguese', ${terms})
                ${cursorCondition}
                AND deleted_at IS NULL
            ORDER BY rank DESC, id ASC
            LIMIT ${pageSize}`;
    }

    public async create(data: CreatePostsRequestDto): Promise<Posts> {
        return await this.db.posts.create({
            data: { ...data },
        });
    }

    public async update(id: string, data: Posts): Promise<Posts | null> {
        return await this.db.posts.update({
            where: { id },
            data: { ...data },
        });
    }

    public async delete(id: string): Promise<void> {
        await this.db.posts.delete({ where: { id } });
    }
}

export type PostStatus = PostStatusEnum;
