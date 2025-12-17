import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Movie as IMovie, Genre } from '../../common/interfaces/content.interface';

@Schema()
export class Movie extends Document implements Omit<IMovie, 'id'> {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop([String])
  genres: Genre[];

  @Prop({ required: true })
  releaseDate: Date;

  @Prop({ required: true })
  director: string;

  @Prop([String])
  actors: string[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);