import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export interface Pagination {
  page: number;
  limit: number;
  size: number;
  offset: number | undefined;
}

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = parseInt(req.query.page as string);
    const size = parseInt(req.query.size as string);
    const MAX_PAGINATION_LIMIT = 100;

    if (isNaN(page) && isNaN(size)) {
      // return { page: undefined, limit: undefined, size: undefined, offset: undefined };
      throw new BadRequestException(
        'Pagination params must be greater than zero',
      );
    }
    if (page === 0 || size === 0) {
      throw new BadRequestException(
        'Pagination params must be greater than zero',
      );
    }
    if (page < 0 || size < 0) {
      throw new BadRequestException('Invalid pagination params');
    }
    if (size > MAX_PAGINATION_LIMIT) {
      throw new BadRequestException(
        `Invalid pagination params: Max size is ${MAX_PAGINATION_LIMIT}`,
      );
    }

    const limit = size;
    const offset = page && limit ? (page - 1) * limit : undefined;
    return { page, limit, size, offset };
  },
);