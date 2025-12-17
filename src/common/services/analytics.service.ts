import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MyListItem } from '../../database/schemas/my-list-item.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(MyListItem.name) private myListModel: Model<MyListItem>,
  ) {}

  async getUserListStats(userId: string) {
    const stats = await this.myListModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalItems: await this.myListModel.countDocuments({ userId }),
      breakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getPopularContent(limit: number = 10) {
    return this.myListModel.aggregate([
      {
        $group: {
          _id: '$contentId',
          contentType: { $first: '$contentType' },
          addedCount: { $sum: 1 },
        },
      },
      { $sort: { addedCount: -1 } },
      { $limit: limit },
    ]);
  }
}