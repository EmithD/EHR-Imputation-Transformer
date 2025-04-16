import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/entities/user.entity";

export type FileDocument = File & Document;

@Schema({
    collection: 'files',
    timestamps: true, // This adds createdAt and updatedAt automatically
})
export class File {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    beFileId: string;

    @Prop({ required: false })
    status: string;

    @Prop({ type: Date, default: Date.now })
    dateCreated: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);