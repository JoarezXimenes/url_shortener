import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UrlModule } from './url/url.module';

@Module({
  imports: [DatabaseModule, UrlModule],
})
export class AppModule {}
