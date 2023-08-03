import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { CarService } from 'src/shared/car';
import { PartService } from 'src/shared/part/part.service';
import { UserService } from 'src/shared/user';
import { v4 as uuidv4 } from 'uuid';

import * as path from 'path';
import Excel from 'exceljs';
import { readdir, unlink } from 'fs/promises';
import { readFileSync } from 'fs';
import { CarEntity } from '#entity/car';
import { IBatchPartResult, IExcelPart, UploadType } from 'src/shared/part/part.interface';

@Injectable()
export class BaseService {
  constructor(private userService: UserService, private carService: CarService, private partService: PartService) {}

  test() {
    const user = this.userService.fetch('ss');
    const car = this.carService.all(1, 8);
    const part = this.partService.fetchById(2);
    console.log(car, part, user);
  }

  async uploadFile(dataBuffer: Buffer | string, fileName: string) {
    const s3 = new S3();
    let body = dataBuffer;
    if (!(dataBuffer instanceof Buffer)) {
      body = readFileSync(dataBuffer);
    }
    try {
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Body: body,
          Key: `${uuidv4()}`, // should be unique, using nanoid
        })
        .promise();

      const fileStorageInDB = {
        fileName: fileName,
        fileUrl: uploadResult.Location,
        key: uploadResult.Key,
      };
      return fileStorageInDB;
    } catch (error) {
      console.log('AWS error for uploading file to s3 ========> ', error);
      throw new BadRequestException('AWS error was happen');
    }
  }

  async getJsonFromExcel(filePath: string) {
    filePath = path.resolve(filePath);
    console.log('filePath===========> ', filePath);
    try {
      const workbook = new Excel.Workbook();
      const content = await workbook.xlsx.readFile(filePath);
      const worksheet = content.worksheets[0];
      // console.log(content, worksheet);
      const rowStartIndex = 2;
      const numberOfRows = worksheet.rowCount - 1;

      const rows = worksheet.getRows(rowStartIndex, numberOfRows) ?? [];
      const partsRough = rows.map((row): IExcelPart => {
        return {
          productName: row.getCell(1).value?.toString() || '',
          ebayLink: row.getCell(2)?.hyperlink ? row.getCell(2).hyperlink : '', // Hyperlink : {text, hyperlink}
          affilLink: row.getCell(3)?.hyperlink ? row.getCell(3).hyperlink : '',
          oem: row.getCell(4).value?.toString() || '',
          msrp: row.getCell(5).value?.toString() || '',
          priceRange: row.getCell(6).value?.toString() || '',
          fitments: row.getCell(7).value?.toString() || '',
          hollanderNumber: row.getCell(8).value?.toString() || '',
        };
      });
      // console.log('partsRough: ========> ', partsRough);
      return partsRough;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Reading xlsx file has issue');
    }
  }

  async clearDirectory(directory: string) {
    const files = await readdir(directory);
    const deletionPromises = files.map((filename) => unlink(path.join(directory, filename)));
    return Promise.all(deletionPromises);
  }

  async batchPhotosUploads(photos: Express.Multer.File[], car: CarEntity): Promise<IBatchPartResult[]> {
    const results: IBatchPartResult[] = [];

    const fileProcessingPromises = photos.map(async (file) => {
      console.log('file to process : ', file);
      // if file is not image, return
      if (!(file?.mimetype || '').includes('image')) {
        results.push({ partName: file.originalname, status: false, reason: 'Not image type', fileType: UploadType.PHOTOS });
        return;
      }

      // search part with given name
      const partName = (file?.originalname || '').split('.')[0];
      const part = await this.partService.findByName(car, partName);
      if (!part) {
        results.push({
          partName: file.originalname,
          status: false,
          reason: 'Not matched with any product name',
          fileType: UploadType.PHOTOS,
        });
        return;
      }
      console.log('file.buffer: ', file.buffer);
      const { fileUrl } = await this.uploadFile(file?.path || file?.buffer, file.originalname);
      await this.partService.updatePhoto(part, fileUrl);
      results.push({ partName: part.productName, status: true, fileType: UploadType.PHOTOS });
    });

    await Promise.all(fileProcessingPromises);

    return results;
  }
}
