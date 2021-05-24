import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './../models/db-repository/user.repository';
import { RegisterDto, LoginDto } from '../helper/dto/auth.dto';
import { JwtPayload } from './../helper/interface/jwt-payload.interface';
import { User } from '../models/entity/user.entity';
import { ChangePasswordDto } from '../helper/dto/change-password.dto';
import SendEmail from './../utils/sendgrid';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(registerDto: RegisterDto): Promise<User> {
    const user = await this.userRepo.signUp(registerDto);

    console.log(user);

    SendEmail(user.username);

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; username: string }> {
    const username = await this.userRepo.loginAuthentication(loginDto);
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken, username };
  }

  async change_password(
    user: User,
    password: ChangePasswordDto,
  ): Promise<string> {
    return this.userRepo.change_password(user, password);
  }
}
