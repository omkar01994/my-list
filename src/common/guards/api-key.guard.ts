import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;
    
    // In production, validate against environment variable or database
    const validApiKey = process.env.API_KEY;
    
    if (!apiKey || (validApiKey && apiKey !== validApiKey)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    
    return true;
  }
}