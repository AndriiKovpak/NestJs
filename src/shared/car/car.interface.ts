import { CarEntity } from '#entity/car';
import { BaseEntityInterface } from '../base';
import { Part } from '../part/part.interface';

export interface Car extends BaseEntityInterface {
  make: string;
  model: string;
  year: string;
  price?: number;
  image: string;
  modelUrl: string;
  parts?: Part[];
}

export interface PagedCars {
  cars: CarEntity[];
  carsCount: number;
}
