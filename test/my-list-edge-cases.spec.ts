import { Test, TestingModule } from '@nestjs/testing';
import { MyListService } from '../src/my-list/my-list.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentType } from '../src/common/enums/content.enum';
import { REDIS_CLIENT } from '../src/config/cache.config';

describe('MyListService Edge Cases', () => {
  let service: MyListService;
  let mockMyListModel: any;
  let mockMovieModel: any;
  let mockTVShowModel: any;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockMyListModel = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn(),
      countDocuments: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockMovieModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn() }),
    };

    mockTVShowModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn() }),
    };

    mockRedisClient = {
      get: jest.fn(),
      setEx: jest.fn(),
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyListService,
        { provide: getModelToken('MyListItem'), useValue: mockMyListModel },
        { provide: getModelToken('Movie'), useValue: mockMovieModel },
        { provide: getModelToken('TVShow'), useValue: mockTVShowModel },
        { provide: REDIS_CLIENT, useValue: mockRedisClient },
      ],
    }).compile();

    service = module.get<MyListService>(MyListService);
  });

  describe('Performance Edge Cases', () => {
    it('should handle cache miss gracefully', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockMyListModel.lean.mockResolvedValue([]);
      mockMyListModel.countDocuments.mockResolvedValue(0);

      const result = await service.getMyList('user123', 1, 20, 0);

      expect(result.items).toEqual([]);
      expect(mockRedisClient.setEx).toHaveBeenCalled();
    });

    it('should handle Redis connection failure gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection failed'));
      mockMyListModel.lean.mockResolvedValue([]);
      mockMyListModel.countDocuments.mockResolvedValue(0);

      await expect(service.getMyList('user123', 1, 20, 0)).rejects.toThrow();
    });

    it('should handle large dataset pagination efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        _id: `item${i}`,
        userId: 'user123',
        contentId: `content${i}`,
        contentType: ContentType.MOVIE,
        createdAt: new Date(),
      }));

      mockMyListModel.lean.mockResolvedValue(largeDataset.slice(0, 100));
      mockMyListModel.countDocuments.mockResolvedValue(1000);

      const result = await service.getMyList('user123', 1, 100, 0);

      expect(result.pagination.total).toBe(1000);
      expect(mockMyListModel.skip).toHaveBeenCalledWith(0);
      expect(mockMyListModel.limit).toHaveBeenCalledWith(100);
    });
  });

  describe('Concurrency Edge Cases', () => {
    it('should handle concurrent additions of same content', async () => {
      mockMovieModel.findById().lean.mockResolvedValue({ _id: 'movie123' });
      mockMyListModel.findOne.mockResolvedValue(null);
      mockMyListModel.prototype.save = jest.fn().mockRejectedValue(
        new Error('E11000 duplicate key error')
      );

      await expect(
        service.addToList('user123', { 
          contentId: 'movie123', 
          contentType: ContentType.MOVIE 
        })
      ).rejects.toThrow();
    });
  });

  describe('Data Integrity Edge Cases', () => {
    it('should handle corrupted content data gracefully', async () => {
      mockMyListModel.lean.mockResolvedValue([
        {
          _id: 'item123',
          userId: 'user123',
          contentId: 'corrupted-movie',
          contentType: ContentType.MOVIE,
          createdAt: new Date(),
        },
      ]);
      mockMyListModel.countDocuments.mockResolvedValue(1);
      mockMovieModel.findById().lean.mockResolvedValue(null);

      const result = await service.getMyList('user123', 1, 20, 0);

      expect(result.items[0].content).toBeNull();
    });
  });
});