import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MyListItem } from '../../database/schemas/my-list-item.schema';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class HealthCheckService {
  constructor(
    @InjectModel(MyListItem.name) private myListModel: Model<MyListItem>,
    private readonly logger: LoggerService,
  ) {}

  async checkHealth() {
    try {
      // Check database connectivity
      const dbCheck = await this.myListModel.findOne().lean().exec();
      
      // Check basic metrics
      const totalItems = await this.myListModel.countDocuments();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        metrics: {
          totalListItems: totalItems
        }
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performHealthCheck() {
    const health = await this.checkHealth();
    if (health.status === 'unhealthy') {
      this.logger.error('System health check failed', health);
    } else {
      this.logger.debug('System health check passed', health);
    }
  }
}