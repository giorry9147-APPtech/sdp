import { Module } from '@nestjs/common';
import { DistrictenController } from './districten.controller';

@Module({
  controllers: [DistrictenController],
})
export class DistrictenModule {}
