import { Controller, Post, Delete, Get, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MyListService } from './my-list.service';
import { AddToListDto } from './dto/add-to-list.dto';
import { MyListResponseDto, AddToListResponseDto } from './dto/response.dto';
import { PaginationParams, Pagination } from '../common/decorators/pagination.decorator';

@ApiTags('My-List')
@Controller('my-list')
export class MyListController {
  constructor(private readonly myListService: MyListService) {}

  // POST endpoint to add movie/tvshow to user's personal list
  @Post()
  @ApiOperation({ summary: 'Add content to user\'s list' })
  @ApiOkResponse({ description: 'Content added to list successfully', type: AddToListResponseDto })
  async addToList(
    @Headers('user-id') userId: string,
    @Body() addToListDto: AddToListDto,
  ): Promise<AddToListResponseDto> {
    return this.myListService.addToList(userId, addToListDto);
  }

  // DELETE endpoint to remove content from user's list by contentId
  @Delete(':contentId')
  @ApiOperation({ summary: 'Remove content from user\'s list' })
  @ApiOkResponse({ description: 'Content removed from list successfully' })
  async removeFromList(
    @Headers('user-id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.myListService.removeFromList(userId, contentId);
  }

  // GET endpoint to retrieve user's list with pagination support
  @Get()
  @ApiOperation({ summary: 'Get paginated user\'s list' })
  @ApiOkResponse({ description: 'Successfully retrieved user\'s list with pagination', type: MyListResponseDto })
  async getMyList(
    @Headers('user-id') userId: string,
    @PaginationParams() pagination: Pagination,
  ): Promise<MyListResponseDto> {
    return this.myListService.getMyList(userId, pagination.page, pagination.limit, pagination.offset);
  }
}