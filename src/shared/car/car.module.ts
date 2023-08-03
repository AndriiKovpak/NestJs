import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CarEntity } from '#entity/car';
import { CarService } from './car.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarEntity])],
  providers: [CarService],
  exports: [CarService],
  controllers: [],
})
export class CarModule {}
