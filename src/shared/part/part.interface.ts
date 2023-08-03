import { PartEntity } from '#entity/part';
import { BaseEntityInterface } from '../base/';

export interface Part extends BaseEntityInterface {
  productName: string;
  productPhoto?: string;
  fitment?: string;
  oem?: string;
  msrp?: string;
  price1?: number;
  price2?: number;
}

export interface PagedParts {
  parts: PartEntity[];
  partsCount: number;
}

export enum UploadType {
  EXCEL = 'EXCEL',
  PHOTOS = 'PHOTOS',
}

export interface IBatchPartResult {
  carId?: number;
  partId?: number;
  partName: string; // partName will be unique in the given car
  status: boolean;
  reason?: string;
  fileType: UploadType;
}

export interface IExcelPart {
  productName: string;
  ebayLink: any;
  affilLink: any;
  oem: string;
  msrp: string;
  priceRange: string;
  fitments: string;
  hollanderNumber: string;
}
