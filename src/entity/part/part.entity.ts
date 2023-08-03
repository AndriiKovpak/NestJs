import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeEntity } from '#entity/base';
import { CarEntity } from '#entity/car';

@Entity('parts')
export class PartEntity extends DateTimeEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column('varchar', { nullable: false, length: 255 })
  productName!: string;

  @Column('varchar', { nullable: true, length: 255 })
  productPhoto!: string;

  @Column('json', { nullable: true })
  fitment!: string;

  @Column('varchar', { nullable: true, length: 255 })
  oem!: string;

  @Column('varchar', { nullable: true, length: 255 })
  msrp!: string;

  // will not use in future
  @Column('double', { nullable: true })
  price1!: number;

  // will not use in future
  @Column('double', { nullable: true })
  price2!: number;

  @Column('varchar', { nullable: true })
  affilLink!: string;

  @Column('varchar', { nullable: true })
  ebayLink!: string;

  // will use this price range for handling excel data
  // like this "$250-$340 for assembly"
  @Column('varchar', { nullable: true })
  priceRange!: string;

  @ManyToOne(() => CarEntity, (car) => car.parts, { onDelete: 'CASCADE' })
  car!: CarEntity;
}
