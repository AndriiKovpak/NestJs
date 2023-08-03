import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Query,
  HttpException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Put,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { CarService } from 'src/shared/car';
import { UserService } from 'src/shared/user';
import { PartService } from 'src/shared/part/part.service';
import { PartCreateDto } from 'src/shared/part/dtos/part.create.dto';
import { JwtAuthGuard, Payload } from 'src/auth';
import { PartQueryList } from 'src/shared/part/dtos/part.query-list.dto';
import { PartEntity } from '#entity/part';
import { ReqUser } from 'src/common';
import { CarEntity } from '#entity/car';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IBatchPartResult } from 'src/shared/part/part.interface';
import { IGlobalSearchResult } from './types/common-type';

const MAX_COUNT_CARS = 100;

@Controller('api')
export class BaseController {
  constructor(
    private baseService: BaseService,
    private userService: UserService,
    private carService: CarService,
    private partService: PartService,
  ) {}

  @Get('test-base')
  @UseGuards(JwtAuthGuard)
  testBase() {
    const user = this.userService.fetch('test@gmail.com');
    const car = this.carService.all(1, 2);
    const part = this.partService.fetchById(1);
    const base = this.baseService.test();
    console.log(car, user, part, base);

    return this.carService.all(1, 2);
  }

  @Get('cars')
  allCars(@Query() query: { pageNumber?: number; pageSize?: number }) {
    let { pageNumber, pageSize } = query;
    if (!pageNumber) pageNumber = 1;
    if (!pageSize) pageSize = 8;
    return this.carService.all(pageNumber, pageSize);
  }

  @Put('cars/:id/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (_req, file, cb) => {
          if (file.fieldname === 'excel') {
            cb(null, './uploads/');
          } else {
            cb(null, './tmp'); // don't store other files
          }
        },
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateCar(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() form: { car: string },
    @Param('id') id: number,
  ): Promise<IBatchPartResult[]> {
    const excel = files.find((file) => file.fieldname === 'excel');
    const photos = files.filter((file) => file.fieldname === 'files');

    let results: IBatchPartResult[] = [];

    // ------- update car -------
    const updatedCar = await this.carService.updateCar(form.car, id);
    // console.log('newCar was created: ', newCar);

    // ------- excel file handling -------
    if (excel) {
      console.log('excel path: ', excel.path);
      const partsRough = await this.baseService.getJsonFromExcel(excel.path);
      const excelResults = await this.partService.saveBatch(updatedCar, partsRough);
      results = [...results, ...excelResults];
      // clean the tmp directory
      this.baseService.clearDirectory('./uploads');
    }

    // ------- photo file handling -------
    if (photos) {
      const photoResults = await this.baseService.batchPhotosUploads(photos, updatedCar);
      results = [...results, ...photoResults];
      // clean the tmp directory
      this.baseService.clearDirectory('./tmp');
    }

    return results;
  }

  @Get('cars/:id/save')
  @UseGuards(JwtAuthGuard)
  async saveToGarage(@ReqUser() _user: Payload, @Param('id') id: string) {
    const user = await this.userService.fetch(_user.username);
    if (user.cars.length === MAX_COUNT_CARS) {
      throw new BadRequestException('You had already 4 cars!');
    }
    return this.carService.saveToGarage(user, parseInt(id));
  }

  @Get('cars/:id/unsave')
  @UseGuards(JwtAuthGuard)
  async unSaveToGarage(@ReqUser() _user: Payload, @Param('id') id: string) {
    const user = await this.userService.fetch(_user.username);
    return this.carService.unSaveToGarage(user, parseInt(id));
  }

  @Get('parts/:id/save')
  @UseGuards(JwtAuthGuard)
  async saveToPart(@ReqUser() _user: Payload, @Param('id') id: string) {
    const user = await this.userService.fetch(_user.username);
    return this.partService.saveToPart(user, parseInt(id));
  }

  @Get('parts/:id/unsave')
  @UseGuards(JwtAuthGuard)
  async unSaveToPart(@ReqUser() _user: Payload, @Param('id') id: string) {
    const user = await this.userService.fetch(_user.username);
    return this.partService.unSaveToPart(user, parseInt(id));
  }

  @Get('cars/my-cars')
  @UseGuards(JwtAuthGuard)
  async myCars(@ReqUser() _user: Payload) {
    const user = await this.userService.fetch(_user.username);
    let cars: CarEntity[];
    if (user.roles.includes('admin')) {
      console.log('cars by admin');
      cars = (await this.carService.all(1, 1000)).cars;
    } else {
      cars = await this.carService.carsByIds(user.cars);
    }
    return cars;
  }

  @Post('cars/new')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (_req, file, cb) => {
          if (file.fieldname === 'excel') {
            cb(null, './uploads/');
          } else {
            cb(null, './tmp'); // don't store other files
          }
        },
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async saveCar(@UploadedFiles() files: Express.Multer.File[], @Body() form: { car: string }): Promise<IBatchPartResult[]> {
    const excel = files.find((file) => file.fieldname === 'excel');
    const photos = files.filter((file) => file.fieldname === 'files');

    let results: IBatchPartResult[] = [];

    // ------- create new car -------
    const newCar = await this.carService.create(form.car);
    // console.log('newCar was created: ', newCar);

    // ------- excel file handling -------
    if (excel) {
      console.log('excel path: ', excel.path);
      const partsRough = await this.baseService.getJsonFromExcel(excel.path);
      const excelResults = await this.partService.saveBatch(newCar, partsRough);
      results = [...results, ...excelResults];
      // clean the tmp directory
      this.baseService.clearDirectory('./uploads');
    }

    // ------- photo file handling -------
    if (photos) {
      const photoResults = await this.baseService.batchPhotosUploads(photos, newCar);
      results = [...results, ...photoResults];
      // clean the tmp directory
      this.baseService.clearDirectory('./tmp');
    }

    return results;
  }

  @Get('cars/:id')
  getCar(@Param('id') id: number) {
    return this.carService.findById(id);
  }

  @Get('cars/:id/detail')
  getCarDetail(@Param('id') id: number) {
    return this.carService.detail(id);
  }

  @Delete('cars/:id/delete')
  async delete(@Param('id') id: number) {
    // if cascade delete is not working, will use this way.
    // const car = await this.carService.detail(id);
    // this.partService.removeAll(car.parts);
    return this.carService.delete(id);
  }

  @Get('parts')
  allParts(@Query() query: PartQueryList): string {
    try {
      if (query?.carId) {
        this.carService.findById(parseInt(query.carId));
      }
      if (query?.userId) {
        this.userService.findById(parseInt(query.userId));
      }
      console.log(query.carId, query.userId);

      return 'all is good' + ' ' + query.carId;
    } catch (error) {
      throw new HttpException('Forbidden', 400);
    }
  }

  @Get('parts/all')
  async all(@Query() query: { pageNumber?: number; pageSize?: number; carId: number; searchKey?: string }) {
    let { pageNumber, pageSize, carId, searchKey } = query;
    if (!pageNumber) pageNumber = 1;
    if (!pageSize) pageSize = 8;
    if (!searchKey) searchKey = '';
    let car = null;
    if (carId > 0) {
      console.log('==================> searchKey', searchKey);
      car = await this.carService.findById(carId);
    }

    return this.partService.all(pageNumber, pageSize, car, searchKey);
  }

  @Get('parts/my-parts')
  @UseGuards(JwtAuthGuard)
  async myParts(@ReqUser() _user: Payload): Promise<PartEntity[]> {
    const user = await this.userService.fetch(_user.username);
    return await this.partService.partsByIds(user.parts || []);
  }

  @Post('cars/:id/parts')
  @UseGuards(JwtAuthGuard)
  async savePart(@Body() part: PartCreateDto, @Param('id') id: number) {
    const car = await this.carService.findById(id);
    return this.partService.create(part, car);
  }

  @Get('parts/:id')
  partDetail(@Param('id') id: number): Promise<PartEntity> {
    return this.partService.fetchById(id);
  }

  @Put('cars/:carId/parts/:partId/update')
  @UseGuards(JwtAuthGuard)
  async updatePart(@Body() part: PartCreateDto, @Param('carId') carId: number, @Param('partId') partId: number) {
    const car = await this.carService.findById(carId);
    return this.partService.update(partId, part, car);
  }

  @Post('contacts')
  contact(@Body() contact: any) {
    console.log(contact);
    // will implement later;
    return contact;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() form: { type: string }) {
    console.log('==============> file: ', file);
    console.log('==============> form: ', form);
    const res = await this.baseService.uploadFile(file.buffer, file.originalname);
    console.log(res);
    return res;
  }

  @Post('cars/:id/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/',
      }),
    }),
  )
  async uploadExcel(@UploadedFile() file: Express.Multer.File, @Param('id') id: number): Promise<IBatchPartResult[]> {
    // store to excel file in uploads folder
    console.log('file ==========> stored to: ', file?.path, id);
    const car = await this.carService.findById(id);

    // get json data from excel file
    const partsRough = await this.baseService.getJsonFromExcel(file.path);

    // store to db
    return await this.partService.saveBatch(car, partsRough);
  }

  @Post('cars/:id/batchPhotos')
  @UseInterceptors(FilesInterceptor('files'))
  async batchPhotos(@UploadedFiles() files: Express.Multer.File[], @Param('id') id: number): Promise<IBatchPartResult[]> {
    const car = await this.carService.findById(id);
    return this.baseService.batchPhotosUploads(files, car);
  }

  @Get('users')
  allUsers(@Query() query: { pageNumber?: number; pageSize?: number }) {
    let { pageNumber, pageSize } = query;
    if (!pageNumber) pageNumber = 1;
    if (!pageSize) pageSize = 8;
    return this.userService.all(pageNumber, pageSize);
  }

  @Get('search')
  async search(@Query() query: { searchKey: string; options: string }): Promise<IGlobalSearchResult[]> {
    const results: IGlobalSearchResult[] = [];
    const searchKey = (query.searchKey || '').trim();
    const cars = await this.carService.findCarsBySearchKey(searchKey);
    cars.forEach((car) => {
      results.push({
        hrefLink: `/model/${car.id}`,
        imageUrl: car.image,
        displayName: car.model,
        description: car?.info || car?.bodyType,
        type: 'car',
      });
    });
    const parts = await this.partService.findPartsBySearchKey(searchKey);
    parts.forEach((part) => {
      results.push({
        hrefLink: `/parts/${part.id}`,
        imageUrl: part?.productPhoto || '/assets/img/no-photo.jpg',
        displayName: `${part.productName} - ${part.car.model}`,
        description: part.oem,
        type: 'part',
      });
    });
    return results;
  }
}
