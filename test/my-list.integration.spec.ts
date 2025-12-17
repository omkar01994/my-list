import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { MyListController } from '../src/my-list/my-list.controller';
import { MyListService } from '../src/my-list/my-list.service';
import { ContentType } from '../src/common/enums/content.enum';
import { REDIS_CLIENT } from '../src/config/cache.config';
import { MyListItem } from '../src/database/schemas/my-list-item.schema';
import { Movie } from '../src/database/schemas/movie.schema';
import { TVShow } from '../src/database/schemas/tvshow.schema';

// Mock Redis client
const mockRedisClient = {
  get: jest.fn().mockResolvedValue(null),
  setEx: jest.fn().mockResolvedValue('OK'),
  keys: jest.fn().mockResolvedValue([]),
  del: jest.fn().mockResolvedValue(1),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
};

// Mock MongoDB models
class MockMyListModel {
  _id: string;
  createdAt: Date;
  userId: string;
  contentId: string;
  contentType: ContentType;

  constructor(data: any) {
    Object.assign(this, data);
    this._id = 'mock-id-' + Math.random();
    this.createdAt = new Date();
  }

  save() {
    return Promise.resolve(this);
  }

  static findOne = jest.fn();
  static find = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();
  static skip = jest.fn().mockReturnThis();
  static limit = jest.fn().mockReturnThis();
  static lean = jest.fn();
  static countDocuments = jest.fn();
  static deleteOne = jest.fn();
}

class MockMovieModel {
  static findById = jest.fn();
}

class MockTVShowModel {
  static findById = jest.fn();
}

describe('MyList Controller Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MyListController],
      providers: [
        MyListService,
        {
          provide: getModelToken(MyListItem.name),
          useValue: MockMyListModel,
        },
        {
          provide: getModelToken(Movie.name),
          useValue: MockMovieModel,
        },
        {
          provide: getModelToken(TVShow.name),
          useValue: MockTVShowModel,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /my-list', () => {
    it('should add movie successfully when content exists', async () => {
      // Setup: Mock content exists
      MockMovieModel.findById.mockResolvedValue({ _id: 'movie-123', title: 'Test Movie' });
      MockMyListModel.findOne.mockResolvedValue(null); // Not already in list

      const dto = { contentId: 'movie-123', contentType: ContentType.MOVIE };

      await request(app.getHttpServer())
        .post('/my-list')
        .set('user-id', 'test-user')
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.contentId).toBe(dto.contentId);
          expect(res.body.contentType).toBe(dto.contentType);
        });
    });

    it('should return 404 when content does not exist', async () => {
      // Setup: Mock content does not exist
      MockMovieModel.findById.mockResolvedValue(null);

      const dto = { contentId: 'non-existent-movie', contentType: ContentType.MOVIE };

      await request(app.getHttpServer())
        .post('/my-list')
        .set('user-id', 'test-user')
        .send(dto)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Movie not found');
        });
    });

    it('should return 409 when content already in list', async () => {
      // Setup: Mock content exists and already in list
      MockMovieModel.findById.mockResolvedValue({ _id: 'movie-duplicate', title: 'Duplicate Movie' });
      MockMyListModel.findOne.mockResolvedValue({ userId: 'test-user', contentId: 'movie-duplicate' });

      const dto = { contentId: 'movie-duplicate', contentType: ContentType.MOVIE };

      await request(app.getHttpServer())
        .post('/my-list')
        .set('user-id', 'test-user')
        .send(dto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Item already in your list');
        });
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/my-list')
        .set('user-id', 'test-user')
        .send({ contentId: '', contentType: 'INVALID' })
        .expect(400);
    });
  });

  describe('DELETE /my-list/:contentId', () => {
    it('should remove item successfully when it exists', async () => {
      // Setup: Mock item exists in list
      MockMyListModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await request(app.getHttpServer())
        .delete('/my-list/movie-delete')
        .set('user-id', 'test-user')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Item removed from list');
        });
    });

    it('should return 404 when item not in list', async () => {
      // Setup: Mock item does not exist in list
      MockMyListModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await request(app.getHttpServer())
        .delete('/my-list/non-existent')
        .set('user-id', 'test-user')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Item not found in your list');
        });
    });
  });

  describe('GET /my-list', () => {
    it('should get list with items when user has content', async () => {
      // Setup: Mock user has items in list
      const mockItems = [
        { userId: 'test-user', contentId: 'movie-1', contentType: ContentType.MOVIE, createdAt: new Date() },
        { userId: 'test-user', contentId: 'tvshow-1', contentType: ContentType.TVSHOW, createdAt: new Date() },
      ];
      MockMyListModel.lean.mockResolvedValue(mockItems);
      MockMyListModel.countDocuments.mockResolvedValue(2);
      
      // Mock content details
      MockMovieModel.findById.mockImplementation((id) => ({
        lean: jest.fn().mockResolvedValue({ _id: id, title: 'Test Movie' }),
      }));
      MockTVShowModel.findById.mockImplementation((id) => ({
        lean: jest.fn().mockResolvedValue({ _id: id, title: 'Test TV Show' }),
      }));

      await request(app.getHttpServer())
        .get('/my-list?page=1&size=20')
        .set('user-id', 'test-user')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(2);
          expect(res.body.pagination).toMatchObject({ 
            page: 1, 
            limit: 20, 
            total: 2
          });
        });
    });

    it('should return empty list when user has no items', async () => {
      // Setup: Mock user has no items
      MockMyListModel.lean.mockResolvedValue([]);
      MockMyListModel.countDocuments.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/my-list?page=1&size=20')
        .set('user-id', 'empty-user')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(0);
          expect(res.body.pagination).toMatchObject({ 
            page: 1, 
            limit: 20, 
            total: 0
          });
        });
    });

    it('should handle pagination correctly with multiple pages', async () => {
      // Setup: Mock large dataset
      const mockItems = [
        { userId: 'test-user', contentId: 'movie-1', contentType: ContentType.MOVIE, createdAt: new Date() }
      ];
      MockMyListModel.lean.mockResolvedValue(mockItems);
      MockMyListModel.countDocuments.mockResolvedValue(10);
      
      MockMovieModel.findById.mockImplementation((id) => ({
        lean: jest.fn().mockResolvedValue({ _id: id, title: 'Test Movie' }),
      }));

      await request(app.getHttpServer())
        .get('/my-list?page=2&size=1')
        .set('user-id', 'test-user')
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(2);
          expect(res.body.pagination.limit).toBe(1);
          expect(res.body.pagination.total).toBe(10);
        });
    });

    it('should return 400 for invalid pagination parameters', async () => {
      await request(app.getHttpServer())
        .get('/my-list?page=0&size=10')
        .set('user-id', 'test-user')
        .expect(400);
    });
  });
});
