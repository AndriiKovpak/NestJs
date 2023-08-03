import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '#entity/user';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProfileDto } from 'src/auth/dtos/update-profile.dto';
import { RegistrationDto } from 'src/auth/dtos/registration.dto';
import { PagedUsers } from './user.interface';
import { AuthProvider } from 'src/auth/providers/auth.provider';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {}

  async signup(registrationDto: RegistrationDto) {
    let user = new UserEntity();
    user.name = registrationDto.name;
    user.email = registrationDto.email;
    user.password = registrationDto.password;
    user.phone = registrationDto.phone;
    user.address = registrationDto.address;
    user.avatar = '/assets/img/avatar-1.png'; // this image should be default avatar.
    user.roles = ['user'];
    user.cars = [];
    user.parts = [];
    if (user.email === 'test@admin.com') {
      user.roles = ['user', 'admin'];
    }
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return user;
  }

  async fetch(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return user;
  }

  async isNewEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async updateProfile(email: string, me: UpdateProfileDto): Promise<UserEntity> {
    const profile = await this.fetch(email);
    profile.name = me.name;
    profile.email = me.email;
    profile.phone = me.phone;
    profile.address = me.address;
    profile.avatar = me?.avatar;
    return this.userRepository.save(profile);
  }

  async updatePassword(user: UserEntity, newPassword: string): Promise<UserEntity> {
    user.password = await AuthProvider.generateHash(newPassword);
    return this.userRepository.save(user);
  }

  async all(pageNumber: number, pageSize: number): Promise<PagedUsers> {
    const usersCount = await this.userRepository.count();
    const users = await this.userRepository.find({
      order: {
        updatedAt: 'DESC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    return { users, usersCount };
  }
}
