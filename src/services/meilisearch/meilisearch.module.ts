import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeilisearchService } from './meilisearch.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MeilisearchService],
  exports: [MeilisearchService],
})
export class MeilisearchModule {}
