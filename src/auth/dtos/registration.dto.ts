import { Allow, IsNotEmpty, IsString } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegistrationDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsNotEmpty()
  readonly phone!: string;

  @Allow()
  readonly address?: string;
}
