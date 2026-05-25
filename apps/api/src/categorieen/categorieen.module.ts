import { Module } from '@nestjs/common';
import { CategorieenController } from './categorieen.controller';

@Module({
  controllers: [CategorieenController],
})
export class CategorieenModule {}
