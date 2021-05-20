import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  ValidationPipe,
  Logger,
  ForbiddenException,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { User } from '../models/entity/user.entity';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './../helper/dto/login-credentials.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './../helper/decorator/extract-user.decorator';
import { ChangePasswordDto } from '../helper/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  signUp(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialsDto,
  ): Promise<User> {
    return this.authService.signUp(authCredentialDto);
  }

  @Post('/login')
  async login(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string; email: string }> {
    const { accessToken, email } = await this.authService.login(
      authCredentialsDto,
    );

    response.cookie('user_token', accessToken, {
      httpOnly: process.env.NODE_ENV === 'development' ? false : true,
    });

    return { accessToken, email };
  }

  @Get('/logout')
  // @Redirect()
  logout(
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ): string | { url: string } {
    if (req.cookies.user_token) {
      response.clearCookie('user_token');
      // url is reserved for redirection
      // return { url: 'https://facebook.com' };
      return 'Logout Success';
    }
    this.logger.error('Logout Failed');
    throw new ForbiddenException();
  }

  @Post('/change-password')
  @UseGuards(AuthGuard('jwt'))
  change_password(
    @GetUser() user: User,
    @Body(ValidationPipe) passwords: ChangePasswordDto,
  ): Promise<string> {
    return this.authService.change_password(user, passwords);
  }

  @Get('/testguard')
  @UseGuards(AuthGuard('jwt'))
  test(@GetUser() user: User) {
    console.log(user);

    return user.email;
  }
}
