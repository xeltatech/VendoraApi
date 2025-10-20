import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { FactoriesController } from './factories.controller';

@Module({
  controllers: [FactoriesController],
  providers: [FactoriesService],
  exports: [FactoriesService],
})
export class FactoriesModule {}
