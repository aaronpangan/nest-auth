import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?:(?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  new_password: string;
}
