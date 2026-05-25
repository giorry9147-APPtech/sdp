import { Module } from '@nestjs/common';
import { RessortenController } from './ressorten.controller';

@Module({
  controllers: [RessortenController],
})
export class RessortenModule {}
