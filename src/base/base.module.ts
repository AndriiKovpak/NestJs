import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import * as controllers from './controllers';
import { AuthModule } from '../auth';
import { CarModule } from 'src/shared/car';
import { PartModule } from 'src/shared/part/part.module';
import { BaseService } from './base.service';
import { BaseController } from './base.controller';

@Module({
  imports: [TerminusModule, AuthModule, HttpModule, CarModule, PartModule], // Authentication
  controllers: [...Object.values(controllers), BaseController],
  exports: [AuthModule],
  providers: [BaseService],
})
export class BaseModule {}
