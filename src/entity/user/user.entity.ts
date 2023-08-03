import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeEntity } from '#entity/base';

@Entity('users')
export class UserEntity extends DateTimeEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column('varchar', { nullable: false, length: 255 })
  name!: string;

  @Column('varchar', { nullable: false, length: 255, unique: true })
  email!: string;

  @Column('varchar', { nullable: false, length: 255 })
  phone!: string;

  @Column('varchar', { nullable: true, length: 255 })
  address?: string;

  @Column('varchar', { nullable: false, length: 255 })
  password!: string;

  @Column('varchar', { nullable: true, length: 255 })
  avatar?: string;

  @Column('simple-array', { nullable: true })
  cars!: number[];

  @Column('simple-array', { nullable: true })
  parts!: number[];

  @Column('simple-array', { nullable: false }) // mysql version complains to have default value
  roles!: string[];
}
