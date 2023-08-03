import { Controller, Get, Post, UseGuards, Req, Res, UnauthorizedException, Body, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService, Payload, AuthenticatedGuard, LocalAuthGuard, JwtAuthGuard, JwtSign, JwtVerifyGuard } from '../../auth';
import { ReqUser } from '../../common';
import { RegistrationDto } from 'src/auth/dtos/registration.dto';
import { UserEntity } from '#entity/user';
import { LoginDto } from 'src/auth/dtos/login.dto';
import { UpdateProfileDto } from 'src/auth/dtos/update-profile.dto';
import { UpdatePasswordDto } from 'src/auth/dtos/update-password.dto';

/**
 * https://docs.nestjs.com/techniques/authentication
 */
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() registrationDto: RegistrationDto): Promise<UserEntity> {
    const user = await this.authService.isNewEmail(registrationDto.email);
    if (user) {
      throw new BadRequestException('Email is already given.');
    }
    return this.authService.registration(registrationDto);
  }

  /**
   * See test/e2e/local-auth.spec.ts
   * need username, password in body
   * skip guard to @Public when using global guard
   */
  @Post('login')
  public async login(@Body() loginDto: LoginDto): Promise<JwtSign> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.jwtSign({ userId: user.id, username: user.email, roles: user.roles });
  }

  @Get('logout')
  public logout(@Req() req: Request, @Res() res: Response): void {
    req.logout(() => {
      res.redirect('/');
    });
  }

  @Get('check')
  @UseGuards(AuthenticatedGuard)
  public check(@ReqUser() user: Payload): Payload {
    return user;
  }

  /**
   * See test/e2e/jwt-auth.spec.ts
   */
  @UseGuards(LocalAuthGuard)
  @Post('jwt/login')
  public jwtLogin(@ReqUser() user: Payload): JwtSign {
    return this.authService.jwtSign(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('jwt/check')
  public jwtCheck(@ReqUser() user: Payload): Payload {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public getMyProfile(@ReqUser() user: Payload): Promise<Omit<UserEntity, 'password'>> {
    return this.authService.fetchUser(user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/update')
  async updateProfile(@ReqUser() user: Payload, @Body() me: UpdateProfileDto): Promise<Omit<UserEntity, 'password'>> {
    const existUser = await this.authService.isNewEmail(me.email);
    if (existUser && me.email !== user.username) {
      throw new BadRequestException('Email is already given.');
    }
    return this.authService.updateProfile(user.username, me);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/update-password')
  public updatePassword(@ReqUser() user: Payload, @Body() creds: UpdatePasswordDto): Promise<Omit<UserEntity, 'password'>> {
    return this.authService.updatePassword(user.username, creds);
  }

  // Only verify is performed without checking the expiration of the access_token.
  @UseGuards(JwtVerifyGuard)
  @Post('jwt/refresh')
  public jwtRefresh(@ReqUser() user: Payload, @Body('refresh_token') token?: string): JwtSign {
    if (!token || !this.authService.validateRefreshToken(user, token)) {
      throw new UnauthorizedException('InvalidRefreshToken');
    }

    return this.authService.jwtSign(user);
  }
}
