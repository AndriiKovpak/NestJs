import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PartEntity } from '#entity/part';
import { PartService } from './part.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartEntity])],
  providers: [PartService],
  exports: [PartService],
})
export class PartModule {}
