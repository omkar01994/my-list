import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ContentType } from '../../common/enums/content.enum';

@Schema({ timestamps: true })
export class MyListItem extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  contentId: string;

  @Prop({ required: true, enum: Object.values(ContentType) })
  contentType: ContentType;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MyListItemSchema = SchemaFactory.createForClass(MyListItem);

// Critical indexes for performance (<10ms requirement)
MyListItemSchema.index({ userId: 1, contentId: 1 }, { unique: true }); // For duplicate check and removal
MyListItemSchema.index({ userId: 1, createdAt: -1 }); // For paginated listing sorted by creation date