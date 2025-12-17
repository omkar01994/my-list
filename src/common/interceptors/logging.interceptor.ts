import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const userId = headers['user-id'];
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`, {
      userId,
      userAgent: headers['user-agent'],
      ip: request.ip
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.logger.log(`Request Completed: ${method} ${url} - ${responseTime}ms`, {
            userId,
            responseTime,
            dataSize: JSON.stringify(data).length
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(`Request Failed: ${method} ${url} - ${responseTime}ms`, {
            userId,
            responseTime,
            error: error.message,
            stack: error.stack
          });
        }
      })
    );
  }
}