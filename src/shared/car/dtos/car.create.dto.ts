import { Allow, IsNotEmpty, Length } from 'class-validator';

export class CarCreateDto {
  @IsNotEmpty()
  @Length(1, 200)
  readonly make!: string;

  @IsNotEmpty()
  @Length(1, 200)
  readonly model!: string;

  @IsNotEmpty()
  readonly year!: number;

  @Allow()
  readonly price!: number;

  @IsNotEmpty()
  // @IsUrl()
  readonly image!: string;

  @IsNotEmpty()
  // @IsUrl()
  readonly modelUrl!: string;

  @Allow()
  readonly photosDirectoryName!: string;
}
