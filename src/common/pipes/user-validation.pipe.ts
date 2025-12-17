import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom' && metadata.data === 'user-id') {
      if (!value) {
        throw new BadRequestException('User ID is required');
      }
      
      // Validate user exists
      const user = await this.userModel.findById(value);
      if (!user) {
        throw new BadRequestException('Invalid user ID');
      }
    }
    return value;
  }
}