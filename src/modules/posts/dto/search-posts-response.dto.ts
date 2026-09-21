import { PostStatus } from '../repository/prisma-posts.repository';

class SearchPostsResponse {
    id!: string;
    title!: string;
    excerpt!: string;
    content!: string;
    status!: PostStatus;
    createdAt!: Date;
    updatedAt!: Date | null;
    deletedAt!: Date | null;
    displayStatus!: string;
    slug!: string;
}

export class SearchPostsResponseDto {
    data!: SearchPostsResponse[];
    pageToken!: string | null;
}
