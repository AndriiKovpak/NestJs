import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeEntity } from '#entity/base';
import { PartEntity } from '#entity/part';

@Entity('cars')
export class CarEntity extends DateTimeEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column('varchar', { nullable: false, length: 255 })
  make!: string;

  @Column('varchar', { nullable: false, length: 255 })
  model!: string;

  @Column('varchar', { nullable: true, length: 255 })
  bodyType?: string;

  @Column('int', { nullable: false })
  year!: number;

  @Column('double', { nullable: true })
  price?: number;

  @Column('varchar', { nullable: true, length: 255 })
  info?: string;

  @Column('varchar', { length: 255 })
  modelUrl!: string;

  @Column('varchar', { length: 255 })
  image!: string;

  @Column('varchar', { length: 255, nullable: true })
  photosDirectoryName?: string;

  @OneToMany(() => PartEntity, (parts) => parts.car)
  parts!: PartEntity[];
}
