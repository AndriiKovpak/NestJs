import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratingDummy1682015918292 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO parts (productName, productPhoto, oem, msrp, price1, price2, carId, fitment)
        VALUES
            ('Air Cleaner Box', '/assets/img/sample-part-4.png', '23252207', 'xxxx-4321', '232', '323', '1', '{\"Chevrolet Suburban 1500\":\"2017-20\",\"GMC Yukon XL 1500\":\"2015-20\",\"Chevrolet Tahoe\":\"2017-20\",\"Cadillac Escalade\":\"2017-19\"}'            ),
            ('Alternator', '/assets/img/sample-part-1.png', '23252207', 'xxxx-4321', '232', '323', '1', '{\"Chevrolet Suburban 1500\":\"2017-20\",\"GMC Yukon XL 1500\":\"2015-20\",\"Chevrolet Tahoe\":\"2017-20\",\"Cadillac Escalade\":\"2017-19\"}'),
            ('Battery', '/assets/img/sample-part-2.png', '23252207', 'xxxx-4321', '232', '323', '1', '{\"Chevrolet Suburban 1500\":\"2017-20\",\"GMC Yukon XL 1500\":\"2015-20\",\"Chevrolet Tahoe\":\"2017-20\",\"Cadillac Escalade\":\"2017-19\"}'),
            ('Engine', '/assets/img/sample-part-3.png', '23252207', 'xxxx-4321', '232', '323', '1', '{\"Chevrolet Suburban 1500\":\"2017-20\",\"GMC Yukon XL 1500\":\"2015-20\",\"Chevrolet Tahoe\":\"2017-20\",\"Cadillac Escalade\":\"2017-19\"}')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users`);
  }
}
