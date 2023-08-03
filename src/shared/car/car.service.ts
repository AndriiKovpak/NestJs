import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CarEntity } from '#entity/car';
import { UserEntity } from '#entity/user';
import { PagedCars } from './car.interface';

@Injectable()
export class CarService {
  constructor(@InjectRepository(CarEntity) private carRepository: Repository<CarEntity>) {}

  async all(pageIndex: number, pageSize: number): Promise<PagedCars> {
    console.log(pageIndex, pageSize);
    const carsCount = await this.carRepository.count();
    const cars = await this.carRepository.find({
      order: {
        updatedAt: 'DESC',
        // id: 'DESC',
      },
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      relations: ['parts'],
    });
    return { cars, carsCount };
  }

  async create(carPayload: CarEntity | string): Promise<CarEntity> {
    let car: CarEntity;
    if (typeof carPayload === 'string') {
      const _car = JSON.parse(carPayload);
      car = new CarEntity();
      car.make = _car.make;
      car.model = _car.model;
      car.bodyType = _car?.bodyType;
      car.modelUrl = _car.modelUrl;
      car.image = _car.image;
      car.year = _car.year;
      car.info = _car.info;
    } else {
      car = carPayload;
    }
    const newCar = this.carRepository.create(car);
    return this.carRepository.save(newCar);
  }

  async updateCar(carPayload: CarEntity | string, carId: number): Promise<CarEntity> {
    let car = await this.findById(carId);
    if (typeof carPayload === 'string') {
      const _car = JSON.parse(carPayload);
      car.make = _car.make;
      car.model = _car.model;
      car.bodyType = _car.bodyType;
      car.modelUrl = _car.modelUrl;
      car.image = _car.image;
      car.year = _car.year;
      car.info = _car.info;
    } else {
      car = carPayload;
    }
    this.carRepository.update(car.id, car);
    return this.carRepository.save(car);
  }

  async findById(id: number): Promise<CarEntity> {
    const car = await this.carRepository.findOneBy({ id });
    if (!car) {
      throw new BadRequestException();
    }
    return car;
  }

  async detail(id: number): Promise<CarEntity> {
    const car = await this.carRepository.findOne({ where: { id }, relations: ['parts'] });
    if (!car) {
      throw new BadRequestException();
    }
    return car;
  }

  async delete(id: number): Promise<boolean> {
    await this.carRepository.delete(id);
    return true;
  }

  async carsByIds<T>(ids: T[]): Promise<CarEntity[]> {
    return this.carRepository.findBy({
      id: In(ids),
    });
  }

  async carsByIdsWithParts<T>(ids: T[]): Promise<CarEntity[]> {
    return this.carRepository.find({
      select: {
        id: true,
      },
      relations: {
        parts: true,
      },
      where: {
        id: In(ids),
      },
    });
  }

  async saveToGarage(user: UserEntity, carId: number) {
    const car = await this.findById(carId);
    user.cars = [...user.cars, carId];
    user.save();
    return this.carRepository.save(car);
  }

  async unSaveToGarage(user: UserEntity, carId: number) {
    const car = await this.findById(carId);
    user.cars = user.cars.filter((id) => id != carId);
    user.save();
    return this.carRepository.save(car);
  }

  async findCarsBySearchKey(key: string): Promise<CarEntity[]> {
    return this.carRepository.find({
      where: {
        model: Like(`%${key}%`),
      },
    });
  }
}
