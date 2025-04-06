import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/entities/user.entity";

export type FileDocument = File & Document;

@Schema({
    collection: 'files',
})
export class File {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    fileId: string;

    @Prop({ required: false })
    status: string;
}

export const FileSchema = SchemaFactory.createForClass(File);