import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User as IUser, Genre } from '../../common/interfaces/content.interface';

@Schema()
export class User extends Document implements Omit<IUser, 'id'> {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({
    type: {
      favoriteGenres: [String],
      dislikedGenres: [String]
    }
  })
  preferences: {
    favoriteGenres: Genre[];
    dislikedGenres: Genre[];
  };

  @Prop([{
    contentId: String,
    watchedOn: Date,
    rating: Number
  }])
  watchHistory: Array<{
    contentId: string;
    watchedOn: Date;
    rating?: number;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);