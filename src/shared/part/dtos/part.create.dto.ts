import { Allow, IsNotEmpty } from 'class-validator';

export class PartCreateDto {
  @IsNotEmpty()
  readonly productName!: string;

  // @IsUrl()
  @Allow()
  readonly productPhoto?: string;

  @Allow()
  readonly fitment!: any;

  @Allow()
  readonly oem?: string;

  @Allow()
  readonly msrp?: string;

  @Allow()
  readonly price1?: number;

  @Allow()
  readonly price2?: number;

  @Allow()
  readonly affilLink?: string;

  @Allow()
  readonly ebayLink?: string;
}
