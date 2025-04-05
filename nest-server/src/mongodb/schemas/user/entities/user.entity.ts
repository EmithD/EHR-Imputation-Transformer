import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({
    collection: 'users',
})
export class User {
    @Prop({ required: true })
    displayName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: false })
    googleAccessToken: string;

    @Prop({ required: false })
    googleRefreshToken: string;

    @Prop({ required: false })
    googleAvatarUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
