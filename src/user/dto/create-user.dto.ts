import { IsDate, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserData } from '../interfaces/user.interface';

export class CreateUserDto implements CreateUserData {
  @IsEmail()
  @ApiProperty({
    example: 'jane.doe@example.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Jane Doe',
  })
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: 'password',
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'user',
    enum: ['admin', 'user', 'guest'],
  })
  role: string;

  @IsDate()
  @ApiProperty()
  createdAt: Date;

  @IsDate()
  @ApiProperty()
  updatedAt: Date;
}
