import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateFileDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: MongooseSchema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  beFileId: string;

  @IsString()
  @IsOptional()
  status?: string;
}
