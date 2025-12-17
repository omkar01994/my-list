import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../config/cache.config';
import { MyListItem } from '../database/schemas/my-list-item.schema';
import { Movie } from '../database/schemas/movie.schema';
import { TVShow } from '../database/schemas/tvshow.schema';
import { Movie as IMovie, TVShow as ITVShow } from '../common/interfaces/content.interface';
import { AddToListDto } from './dto/add-to-list.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constant';
import { ContentType } from '../common/enums/content.enum';


@Injectable()
export class MyListService {
  constructor(
    @InjectModel(MyListItem.name) private myListModel: Model<MyListItem>,
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(TVShow.name) private tvShowModel: Model<TVShow>,
    @Inject(REDIS_CLIENT) private redisClient: RedisClientType,
  ) {}

  // Add content to user's personal list with validation and caching
  async addToList(userId: string, addToListDto: AddToListDto) {
    try {
      const { contentId, contentType } = addToListDto;

      // Validate that content exists
      if (contentType === ContentType.MOVIE) {
        const movie = await this.movieModel.findById(contentId);
        if (!movie) {
          throw new NotFoundException(ERROR_MESSAGES.MOVIE_NOT_FOUND);
        }
      } else if (contentType === ContentType.TVSHOW) {
        const tvShow = await this.tvShowModel.findById(contentId);
        if (!tvShow) {
          throw new NotFoundException(ERROR_MESSAGES.TV_SHOW_NOT_FOUND);
        }
      }

      // Check if already exists
      const existing = await this.myListModel.findOne({ userId, contentId });
      if (existing) {
        throw new ConflictException(ERROR_MESSAGES.ITEM_ALREADY_EXISTS);
      }

      const listItem = new this.myListModel({
        userId,
        contentId,
        contentType,
      });
      
      const savedItem = await listItem.save();
      
      // Invalidate user's cache after successful addition
      const pattern = `my-list:${userId}:*`;
      const keys = await this.redisClient.keys(pattern) as string[];
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.redisClient.del(key)));
      }
      
      return savedItem;
    } catch (error) {
      throw error;
    }
  }

  // Remove content from user's list and invalidate cache
  async removeFromList(userId: string, contentId: string) {
    try {
      const result = await this.myListModel.deleteOne({ userId, contentId });

      if (result.deletedCount === 0) {
        throw new NotFoundException(ERROR_MESSAGES.ITEM_NOT_FOUND);
      }
      
      // Invalidate user's cache after successful removal
      const pattern = `my-list:${userId}:*`;
      const keys = await this.redisClient.keys(pattern) as string[];
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.redisClient.del(key)));
      }
      
      return { message: SUCCESS_MESSAGES.ITEM_REMOVED };
    } catch (error) {
      throw error;
    }
  }

  // Get paginated user list with Redis caching for sub-10ms performance
  async getMyList(userId: string, page: number, limit: number, offset: number) {
    try {
      // Check cache first for performance (sub-10ms requirement)
      const cacheKey = `my-list:${userId}:${page}:${limit}`;
      const cachedResult = await this.redisClient.get(cacheKey) as string | null;
      
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }
      
      const [listItems, total] = await Promise.all([
        this.myListModel
          .find({ userId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
        this.myListModel.countDocuments({ userId })
      ]);

      // Populate content details for each list item
      const items = await Promise.all(
        listItems.map(async (item) => {
          let content;
          if (item.contentType === ContentType.MOVIE) {
            content = await this.movieModel.findById(item.contentId).lean();
          } else if (item.contentType === ContentType.TVSHOW) {
            content = await this.tvShowModel.findById(item.contentId).lean();
          }

          return {
            id: item._id,
            contentType: item.contentType as ContentType.MOVIE | ContentType.TVSHOW,
            addedAt: item.createdAt,
            content: content as IMovie | ITVShow | null,
          };
        })
      );

      const result = {
        items,
        pagination: {
          page,
          limit,
          total
        },
      };

      // Cache result for 5 minutes to improve performance
      await this.redisClient.setEx(cacheKey, 300, JSON.stringify(result));
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}