import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserIdValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      throw new BadRequestException('User ID header is required');
    }
    
    // Basic MongoDB ObjectId validation
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }
    
    next();
  }
}