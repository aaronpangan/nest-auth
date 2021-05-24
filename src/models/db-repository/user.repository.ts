import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from '../../helper/dto/change-password.dto';
import { RegisterDto, LoginDto } from './../../helper/dto/auth.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('TaskRepository');

  async signUp(registerDto: RegisterDto): Promise<User> {
    const { email, password, username } = registerDto;

    const newUser = new User();
    newUser.email = email;
    newUser.username = username;
    newUser.salt = await bcrypt.genSalt();
    newUser.password = await this.passwordEncrypt(password, newUser.salt);

    try {
      await newUser.save();
      this.logger.verbose(
        `Successfully Registerd Email: ${newUser.email} and Username: ${newUser.username}`,
      );
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error(
          'Duplicate Values for Email or Username Upon Registering',
        );
        throw new ConflictException('Email or Username Already Exist');
      } else {
        this.logger.error('Database Error');
        throw new InternalServerErrorException();
      }
    }
    return newUser;
  }

  async loginAuthentication(loginDto: LoginDto): Promise<string> {
    const { username, password } = loginDto;
    const user = await this.findOne({ username });
    if (user && (await user.validatePassword(password))) {
      if (!user.isVerified)
        throw new UnauthorizedException(`Activate Your Account First`);

      return user.username;
    } else throw new UnauthorizedException(`Credentials Error`);
  }

  async change_password(user: User, password: ChangePasswordDto) {
    const validateNewPassword = await user.validatePassword(
      password.new_password,
    );
    const validateOldPassword = await user.validatePassword(
      password.current_password,
    );

    if (!validateOldPassword)
      throw new NotAcceptableException('Old Password is wrong');

    if (validateNewPassword)
      throw new NotAcceptableException('You must not use your old password');

    user.salt = await bcrypt.genSalt();
    user.password = await this.passwordEncrypt(
      password.new_password,
      user.salt,
    );

    try {
      await user.save();
    } catch (error) {
      this.logger.error(
        `Failed to change password for user "${user.email}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
    return await 'Success';
  }

  private async passwordEncrypt(
    password: string,
    salt: string,
  ): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
