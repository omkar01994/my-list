import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  private readonly limit = parseInt(process.env.RATE_LIMIT_MAX || '100');
  private readonly windowMs = parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000;

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientId(req);
    const now = Date.now();
    
    let requestInfo = this.requests.get(clientId);
    
    // Reset if window has expired
    if (!requestInfo || now > requestInfo.resetTime) {
      requestInfo = {
        count: 0,
        resetTime: now + this.windowMs
      };
    }
    
    requestInfo.count++;
    this.requests.set(clientId, requestInfo);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.limit - requestInfo.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestInfo.resetTime / 1000));
    
    if (requestInfo.count > this.limit) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000)
      });
      return;
    }
    
    next();
  }
  
  private getClientId(req: Request): string {
    // Use user-id if available, otherwise fall back to IP
    return req.headers['user-id'] as string || req.ip || req.connection.remoteAddress || 'unknown';
  }
}