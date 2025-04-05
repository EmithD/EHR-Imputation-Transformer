import { UserModule } from './schemas/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
                if (!uri) {
                    throw new Error('MONGODB_URI is not defined in environment variables');
                }
                return {
                    uri: uri,
                    dbName: 'fyp_dev',
                };
            },
        }),
        UserModule,
    ],
    exports: [
        MongooseModule,
    ],
})
export class MongoDbModule {}