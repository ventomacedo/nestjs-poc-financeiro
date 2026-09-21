import { Posts as PostsType } from '@prisma';
import { CreatePostsRequestDto } from '../dto/create-posts-request.dto';
import { UpdatePostsRequestDto } from '../dto/update-posts-request.dto';

export type Posts = PostsType;
export const POSTS_REPOSITORY = Symbol('POSTS_REPOSITORY');

export interface IPostsInterface {
    find(take: number, cursorId: string | undefined): Promise<Posts[]>;
    findBySlug(slug: string): Promise<Posts | null>;

    search(params: {
        terms: string;
        pageSize: number;
        lastRank?: number | null;
        lastId?: string | null;
    }): Promise<any[]>;

    create(data: CreatePostsRequestDto): Promise<Posts>;
    update(id: string, data: UpdatePostsRequestDto): Promise<Posts | null>;
    delete(id: string): Promise<void>;
}
