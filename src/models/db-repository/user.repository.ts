import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { AuthCredentialsDto } from '../../helper/dto/login-credentials.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from '../../helper/dto/change-password.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('TaskRepository');

  async signUp(authCredentialDto: AuthCredentialsDto): Promise<User> {
    const { email, password } = authCredentialDto;

    const newUser = new User();
    newUser.email = email;
    newUser.salt = await bcrypt.genSalt();
    newUser.password = await this.passwordEncrypt(password, newUser.salt);

    try {
      await newUser.save();
    } catch (error) {
      // 23505 error if duplicate
      if (error.code === '23505')
        throw new ConflictException('Email already exists');
      else {
        throw new InternalServerErrorException();
      }
    }
    return newUser;
  }

  async loginAuthentication(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { email, password } = authCredentialsDto;
    const user = await this.findOne({ email });
    if (user && (await user.validatePassword(password))) {
      return user.email;
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
