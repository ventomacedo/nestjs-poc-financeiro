import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaPostsRepository } from './repository/prisma-posts.repository';
import { POSTS_REPOSITORY } from './repository/posts.repository';

@Module({
    imports: [],
    controllers: [PostsController],
    providers: [
        PostsService,
        { provide: POSTS_REPOSITORY, useClass: PrismaPostsRepository },
    ],
    exports: [],
})
export class PostsModule {}
