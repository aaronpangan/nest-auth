import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './../models/db-repository/user.repository';
import { AuthCredentialsDto } from './../helper/dto/login-credentials.dto';
import { JwtPayload } from './../helper/interface/jwt-payload.interface';
import { User } from '../models/entity/user.entity';
import { ChangePasswordDto } from '../helper/dto/change-password.dto';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
    private jwtService: JwtService,
  ) {}

  signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const user = this.userRepo.signUp(authCredentialsDto);

    return user;
  }

  async login(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; email: string }> {
    const email = await this.userRepo.loginAuthentication(authCredentialsDto);
    const payload: JwtPayload = { email };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken, email };
  }

  async change_password(
    user: User,
    password: ChangePasswordDto,
  ): Promise<string> {
    return this.userRepo.change_password(user, password);
  }
}
