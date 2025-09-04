import { IsEmail, IsNotEmpty } from 'class-validator';
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
  fullName: string;

  @IsNotEmpty()
  password: string;
}
