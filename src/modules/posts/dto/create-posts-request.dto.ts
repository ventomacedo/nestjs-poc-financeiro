import { Injectable } from '@nestjs/common';
import type { PostStatus } from '../repository/prisma-posts.repository';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
export class CreatePostsRequestDto {
    @IsNotEmpty({ message: 'title é um campo obrigatório.' })
    @ApiProperty({ description: 'Título que será usado para o slug' })
    title!: string;

    @IsNotEmpty({ message: 'authorId é um campo obrigatório.' })
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

    @IsNotEmpty({ message: 'status é um campo obrigatório.' })
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
