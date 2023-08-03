import { BadRequestException, Injectable } from '@nestjs/common';
import { In, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PartEntity } from '#entity/part';
import { PartCreateDto } from './dtos/part.create.dto';
import { CarEntity } from '#entity/car';
import { IBatchPartResult, IExcelPart, PagedParts, UploadType } from './part.interface';
import { UserEntity } from '#entity/user';

@Injectable()
export class PartService {
  constructor(@InjectRepository(PartEntity) private partRepository: Repository<PartEntity>) {}

  public async fetchById(id: number): Promise<PartEntity> {
    const Part = await this.partRepository.findOne({
      where: { id },
      relations: { car: true },
    });
    if (!Part) {
      throw new BadRequestException('Part was not found for given id');
    }
    return Part;
  }

  public async findByName(car: CarEntity, productName: string): Promise<PartEntity | null> {
    return await this.partRepository
      .createQueryBuilder('part')
      .innerJoinAndSelect('part.car', 'car')
      .where('part.productName = :productName', { productName: productName })
      .andWhere('car.id = :carId', { carId: car.id })
      .getOne();
  }

  public async updatePhoto(part: PartEntity, productPhoto: string): Promise<PartEntity> {
    part.productPhoto = productPhoto;
    return this.partRepository.save(part);
  }

  create(part: PartCreateDto, car: CarEntity) {
    console.log('part=========> ', part);
    const newPart = this.partRepository.create(part);
    newPart.car = car;
    return this.partRepository.save(newPart);
  }

  async update(partId: number, _part: PartCreateDto, car: CarEntity) {
    console.log('part=========> ', _part);
    const part = await this.fetchById(partId);
    this.partRepository.update(part.id, _part);
    part.car = car;
    return this.partRepository.save(part);
  }

  async removeAll(parts: PartEntity[]) {
    this.partRepository.remove(parts);
  }

  async saveBatch(car: CarEntity, partsRough: IExcelPart[]): Promise<IBatchPartResult[]> {
    // console.log(car);
    const results: IBatchPartResult[] = [];
    for (const part of partsRough) {
      if (!part.productName) {
        continue;
      }
      try {
        const fitment = part.fitments.trim()
          ? part.fitments.split(',').reduce((acc: any, cur: string) => {
              if (cur.trim()) {
                const splited = cur.split(':');
                const value = splited.length > 1 ? splited[1].trim() : '';
                return { ...acc, [splited[0].trim()]: value };
              }
              return acc;
            }, {})
          : {};
        const newPart = {
          ...part,
          msrp: this.addDollar(part.msrp),
          fitment: fitment,
          productPhoto: '',
          car: car,
        };

        let existPart = await this.partRepository
          .createQueryBuilder('part')
          .innerJoinAndSelect('part.car', 'car')
          .where('part.productName = :productName', { productName: part.productName })
          .andWhere('car.id = :carId', { carId: car.id })
          .getOne();
        if (existPart) {
          // update existPart
          existPart.productPhoto = newPart.productPhoto;
          existPart.fitment = newPart.fitment;
          existPart.oem = newPart.oem;
          existPart.msrp = newPart.msrp;
          existPart.priceRange = newPart.priceRange;
          existPart.affilLink = newPart.affilLink;
          existPart.ebayLink = newPart.ebayLink;
        } else {
          // create new part
          existPart = this.partRepository.create(newPart);
        }
        await this.partRepository.save(existPart);
        results.push({ partName: existPart.productName, status: true, fileType: UploadType.EXCEL });
      } catch (error) {
        if (error instanceof QueryFailedError) {
          results.push({ partName: part.productName, status: false, reason: error.message, fileType: UploadType.EXCEL });
        }
      }
    }
    return results;
  }

  addDollar(str: string): string {
    if (typeof str !== 'string') return '';
    if (str.length > 0 && /^[0-9]/.test(str[0])) {
      return '$' + str;
    } else {
      return str;
    }
  }

  async all(pageIndex: number, pageSize: number, car: CarEntity | null, searchKey: string = ''): Promise<PagedParts> {
    console.log('part.services-------', pageIndex, pageSize, searchKey);

    const countQb = this.partRepository.createQueryBuilder('part').innerJoinAndSelect('part.car', 'car');
    const qb = this.partRepository
      .createQueryBuilder('part')
      .innerJoinAndSelect('part.car', 'car')
      .orderBy('part.updatedAt', 'DESC')
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize);

    if (searchKey) {
      qb.andWhere('(part.productName LIKE :name OR part.oem LIKE :oem OR part.msrp LIKE :msrp)', {
        name: `%${searchKey}%`,
        oem: `%${searchKey}%`,
        msrp: `%${searchKey}%`,
      });
      countQb.andWhere('(part.productName LIKE :name OR part.oem LIKE :oem OR part.msrp LIKE :msrp)', {
        name: `%${searchKey}%`,
        oem: `%${searchKey}%`,
        msrp: `%${searchKey}%`,
      });
    }

    if (car) {
      qb.andWhere('car.id = :id', { id: car.id });
      countQb.andWhere('car.id = :id', { id: car.id });
    }

    const partsCount = await countQb.getCount();
    const parts = await qb.getMany();

    return { parts, partsCount };
  }

  async findPartsBySearchKey(searchKey: string): Promise<PartEntity[]> {
    return this.partRepository
      .createQueryBuilder('part')
      .innerJoinAndSelect('part.car', 'car')
      .where('(part.productName LIKE :name OR part.oem LIKE :oem OR part.msrp LIKE :msrp)', {
        name: `%${searchKey}%`,
        oem: `%${searchKey}%`,
        msrp: `%${searchKey}%`,
      })
      .getMany();
  }

  async saveToPart(user: UserEntity, partId: number) {
    const part = await this.fetchById(partId);
    user.parts = [...(user.parts || []), partId];
    user.save();
    return this.partRepository.save(part);
  }

  async unSaveToPart(user: UserEntity, partId: number) {
    const part = await this.fetchById(partId);
    user.parts = (user.parts || []).filter((id) => id != partId);
    user.save();
    return this.partRepository.save(part);
  }

  async partsByIds<T>(ids: T[]): Promise<PartEntity[]> {
    return this.partRepository.findBy({
      id: In(ids),
    });
  }
}
