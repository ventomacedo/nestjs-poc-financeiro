import { Injectable } from '@nestjs/common';
import type { PostStatus } from '../repository/prisma-posts.repository';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
export class UpdatePostsRequestDto {
    @ApiProperty({ description: 'Título que será usado para o slug' })
    title!: string;

    @ApiProperty({
        description: 'Autor é o usuários que está criando este post',
    })
    authorId!: string;

    @IsOptional()
    @ApiProperty({ description: 'Descrição do post Ideal para SEO' })
    excerpt!: string;

    @IsOptional()
    @ApiProperty({ description: 'Conteído do post' })
    content!: string;

    @ApiProperty({
        description: 'Status possíveis "PUBLISHED" | "DRAFT"',
    })
    status!: PostStatus;

    @IsOptional()
    @ApiProperty({
        description: 'slug do post',
    })
    slug!: string;
}
