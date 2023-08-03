import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { JwtPayload, JwtSign, Payload } from './auth.interface';
import { User, UserService } from '../shared/user';
import { UserEntity } from '../entity/user';
import { RegistrationDto } from './dtos/registration.dto';
import { AuthProvider } from './providers/auth.provider';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private userService: UserService, private config: ConfigService) {}

  async registration(registrationDto: RegistrationDto): Promise<UserEntity> {
    return this.userService.signup(registrationDto);
  }

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.fetch(email);
    const passwordMatched = await AuthProvider.compare(password, user.password);
    if (!passwordMatched) {
      console.log('<================= Password is not matched: =================>', password, user.password);
      throw new BadRequestException('Incorect credential');
    }
    return user;
  }

  async isNewEmail(email: string): Promise<UserEntity | null> {
    return this.userService.isNewEmail(email);
  }

  public validateRefreshToken(data: Payload, refreshToken: string): boolean {
    if (!this.jwt.verify(refreshToken, { secret: this.config.get('jwtRefreshSecret') })) {
      return false;
    }

    const payload = <{ sub: string }>this.jwt.decode(refreshToken);
    return payload.sub === data.userId;
  }

  public jwtSign(data: Payload): JwtSign {
    const payload: JwtPayload = { sub: data.userId as string, username: data.username, roles: data.roles };

    return {
      access_token: this.jwt.sign(payload, { expiresIn: '120d' }),
      refresh_token: this.getRefreshToken(payload.sub),
    };
  }

  private getRefreshToken(sub: string): string {
    return this.jwt.sign(
      { sub },
      {
        secret: this.config.get('jwtRefreshSecret'),
        expiresIn: '7d', // Set greater than the expiresIn of the access_token
      },
    );
  }

  async fetchUser(email: string): Promise<UserEntity> {
    return this.userService.fetch(email);
  }

  async updateProfile(email: string, me: UpdateProfileDto): Promise<UserEntity> {
    return this.userService.updateProfile(email, me);
  }

  async updatePassword(email: string, creds: UpdatePasswordDto): Promise<UserEntity> {
    const profile = await this.fetchUser(email);
    const passwordMatched = await AuthProvider.compare(creds.old, profile.password);
    if (!passwordMatched) {
      console.log('Old password is not matched: =============> ');
      throw new BadRequestException('Old password is not matched');
    }
    return this.userService.updatePassword(profile, creds.new);
  }
}
