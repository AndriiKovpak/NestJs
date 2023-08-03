import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  new!: string;
  @IsNotEmpty()
  old!: string;
}
