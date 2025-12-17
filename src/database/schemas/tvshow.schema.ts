import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TVShow as ITVShow, Genre } from '../../common/interfaces/content.interface';

@Schema()
export class TVShow extends Document implements Omit<ITVShow, 'id'> {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop([String])
  genres: Genre[];

  @Prop([{
    episodeNumber: Number,
    seasonNumber: Number,
    releaseDate: Date,
    director: String,
    actors: [String]
  }])
  episodes: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: Date;
    director: string;
    actors: string[];
  }>;
}

export const TVShowSchema = SchemaFactory.createForClass(TVShow);