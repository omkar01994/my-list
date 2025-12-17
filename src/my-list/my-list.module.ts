import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyListController } from './my-list.controller';
import { MyListService } from './my-list.service';
import { MyListItem, MyListItemSchema } from '../database/schemas/my-list-item.schema';
import { Movie, MovieSchema } from '../database/schemas/movie.schema';
import { TVShow, TVShowSchema } from '../database/schemas/tvshow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MyListItem.name, schema: MyListItemSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: TVShow.name, schema: TVShowSchema },
    ]),
  ],
  controllers: [MyListController],
  providers: [MyListService],
})
export class MyListModule {}