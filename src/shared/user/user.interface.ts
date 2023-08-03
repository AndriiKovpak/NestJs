import { UserEntity } from '#entity/user';
import { BaseEntityInterface } from '../base';

export interface User extends BaseEntityInterface {
  name: string;
  email: string;
  phone: string;
  address?: string;
  roles: string[];
  password?: string;
}

export interface PagedUsers {
  users: UserEntity[];
  usersCount: number;
}
