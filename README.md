# My List Service

A high-performance NestJS backend service for managing user's favorite movies and TV shows with sub-10ms response times.

## Features

- **Add to My List**: Add movies/TV shows to user's personal list (no duplicates)
- **Remove from My List**: Remove items using content ID
- **List My Items**: Paginated retrieval with Redis caching for performance
- **Performance Optimized**: Redis caching + MongoDB indexing for <10ms responses
- **Comprehensive Testing**: Integration tests for all endpoints

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Caching**: Redis for performance optimization
- **Testing**: Jest with Supertest
- **Validation**: Class-validator

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Redis running locally

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Seed test data**:
```bash
npm run seed
```

3. **Start development server**:
```bash
npm run start:dev
```

## API Endpoints

### Add to My List
```http
POST /my-list
Headers: user-id: <userId>
Body: { "contentId": "string", "contentType": "movie|tvshow" }
```

### Remove from My List
```http
DELETE /my-list/:contentId
Headers: user-id: <userId>
```

### Get My List (Paginated)
```http
GET /my-list?page=1&limit=20
Headers: user-id: <userId>
```

## Testing

```bash
# Run integration tests
npm run test:integration
```

## Performance Optimizations

1. **Redis Caching**: 5-minute cache for list queries
2. **Database Indexing**: Compound indexes on userId + contentId
3. **Lean Queries**: MongoDB lean() for faster responses
4. **Connection Pooling**: Optimized MongoDB connections

## Design Decisions

### Database Schema
- **MyListItem**: Separate collection for scalability
- **Compound Indexes**: (userId, contentId) for uniqueness and performance
- **Timestamps**: Automatic createdAt/updatedAt tracking

### Caching Strategy
- **Cache Key Pattern**: `mylist:${userId}:${page}:${limit}`
- **TTL**: 5 minutes for balance between performance and freshness
- **Cache Invalidation**: On add/remove operations

### Error Handling
- **409 Conflict**: Duplicate items
- **404 Not Found**: Non-existent content or list items
- **Validation**: DTO validation with class-validator

## Assumptions

1. **Authentication**: Mock user-id header (production would use JWT)
2. **Content Validation**: Verifies movie/TV show exists before adding
3. **Pagination**: Default 20 items per page, maximum 100
4. **Performance Target**: <10ms for cached responses

## Project Structure

```
src/
├── /my-list/          # Core My List feature
│   ├── dto/                  # Data transfer objects
│   ├── my-list.controller.ts # REST endpoints
│   ├── my-list.service.ts    # Business logic + caching
│   └── my-list.module.ts     # Module configuration
├── database/schemas/         # MongoDB schemas
├── common/interfaces/        # TypeScript interfaces
└── main.ts                   # Application entry point
```