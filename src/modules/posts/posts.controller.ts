import { PostsService } from './posts.service';
import { JwthGuard } from '@auth';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SearchPostsRequestDto } from './dto/search-posts-request.dto';
import { FindPostsRequestDto } from './dto/find-posts-request.dto';
import { SearchPostsResponseDto } from './dto/search-posts-response.dto';
import { FindPostsResponseDto } from './dto/find-posts-response.dto';
import { CreatePostsRequestDto } from './dto/create-posts-request.dto';
import { UpdatePostsRequestDto } from './dto/update-posts-request.dto';

@Controller('/posts')
export class PostsController {
    constructor(private readonly PostsService: PostsService) {}

    @Get('/')
    @UseGuards(JwthGuard)
    public async Posts(
        @Query() body: FindPostsRequestDto,
    ): Promise<FindPostsResponseDto> {
        return await this.PostsService.find(
            body.pageSize ?? 10,
            body.pageToken,
        );
    }

    @Get('/search')
    @UseGuards(JwthGuard)
    public async searchPost(
        @Query() body: SearchPostsRequestDto,
    ): Promise<SearchPostsResponseDto> {
        return await this.PostsService.search(body);
    }

    @Get('/:slug')
    @UseGuards(JwthGuard)
    public async getPostBySlug(@Param('slug') slug: string) {
        return await this.PostsService.findBySlug(slug);
    }

    @Post('/')
    @UseGuards(JwthGuard)
    public async createPost(@Body() body: CreatePostsRequestDto) {
        return await this.PostsService.create(body);
    }

    @Put('/:id')
    @UseGuards(JwthGuard)
    public async updatePost(
        @Param('id') id: string,
        @Body() body: UpdatePostsRequestDto,
    ) {
        return await this.PostsService.update(id, body);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(JwthGuard)
    public async deletePost(@Param('id') id: string) {
        return await this.PostsService.delete(id);
    }
}
