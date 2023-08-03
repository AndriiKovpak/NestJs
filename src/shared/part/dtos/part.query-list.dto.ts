import { IsNotEmpty } from 'class-validator';

export class PartQueryList {
  @IsNotEmpty()
  readonly userId?: any;
  @IsNotEmpty()
  readonly carId?: any;
}
