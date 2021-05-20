import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from '../../helper/interface/jwt-payload.interface';
import { UserRepository } from '../../models/db-repository/user.repository';
import { User } from '../../models/entity/user.entity';
import * as config from 'config';
import { Request } from 'express';

// FOR VALIDATING Authorization header
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.user_token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;

    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedException();
    }
    // Attaches ONLY the user to the full request, not replacing it.
    return user;
  }
}
