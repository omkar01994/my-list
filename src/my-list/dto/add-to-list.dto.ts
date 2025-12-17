import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../common/enums/content.enum';

export class AddToListDto {
  @ApiProperty({ 
    description: 'ID of the content to add to the list',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  contentId: string;

  @ApiProperty({ 
    description: 'Type of content',
    enum: ContentType,
    example: ContentType.MOVIE
  })
  @IsEnum(ContentType)
  contentType: ContentType;
}