import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MinLength(4)
  email: string;

  @MinLength(4)
  @MaxLength(30)
  @IsString()
  username: string

  @IsString()
  @MinLength(8)
  @MaxLength(25)
  @Matches(/(?:(?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}

export class LoginDto {

  @IsString()
  username: string

  @IsString()
  password: string


}