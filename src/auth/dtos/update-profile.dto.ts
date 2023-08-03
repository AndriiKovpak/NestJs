import { Allow, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @IsNotEmpty()
  readonly phone!: string;

  @IsNotEmpty()
  readonly address!: string;

  @Allow()
  readonly avatar?: string;
}
