import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../common/enums/content.enum';

export class ContentDetailsDto {
  @ApiProperty({ description: 'Content ID', example: '507f1f77bcf86cd799439012', required: false })
  _id?: string;

  @ApiProperty({ description: 'Content title', example: 'Inception' })
  title: string;

  @ApiProperty({ description: 'Content description', example: 'A thief who steals corporate secrets...' })
  description: string;

  @ApiProperty({ description: 'Content genres', example: ['Action', 'SciFi'] })
  genres: string[];

  @ApiProperty({ description: 'Release date', example: '2010-07-16T00:00:00.000Z' })
  releaseDate?: Date;

  @ApiProperty({ description: 'Director name', example: 'Christopher Nolan' })
  director?: string;

  @ApiProperty({ description: 'List of actors', example: ['Leonardo DiCaprio', 'Marion Cotillard'] })
  actors?: string[];

  @ApiProperty({ description: 'Episodes (for TV shows only)', required: false })
  episodes?: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: Date;
    director: string;
    actors: string[];
  }>;
}

export class MyListItemResponseDto {
  @ApiProperty({ description: 'Item ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Content type', enum: ContentType, example: ContentType.MOVIE })
  contentType: ContentType;

  @ApiProperty({ description: 'Date when item was added', example: '2024-01-15T10:00:00.000Z' })
  addedAt: Date;

  @ApiProperty({ description: 'Full content details' })
  content: ContentDetailsDto;
}

export class PaginationResponseDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 25 })
  total: number;
}

export class MyListResponseDto {
  @ApiProperty({ type: [MyListItemResponseDto], description: 'List of user\'s items' })
  items: MyListItemResponseDto[];

  @ApiProperty({ type: PaginationResponseDto, description: 'Pagination information' })
  pagination: PaginationResponseDto;
}

export class AddToListResponseDto {
  @ApiProperty({ description: 'Item ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: 'User ID', example: '507f191e810c19729de860ea' })
  userId: string;

  @ApiProperty({ description: 'Content ID', example: '507f1f77bcf86cd799439012' })
  contentId: string;

  @ApiProperty({ description: 'Content type', enum: ContentType, example: ContentType.MOVIE })
  contentType: ContentType;

  @ApiProperty({ description: 'Date when item was created', example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when item was last updated', example: '2024-01-15T10:00:00.000Z' })
  updatedAt?: Date;
}