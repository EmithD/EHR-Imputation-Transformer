import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoDbModule } from './mongodb/mongodb.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './mongodb/schemas/user/user.module';
import { FilesModule } from './mongodb/schemas/files/files.module';

@Module({
  imports: [FilesModule, MongoDbModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}