import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserData } from '../interfaces/user.interface';

class RoleDto {
  id: number;
}

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

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  createdBy?: string;

  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roles: RoleDto[];
}
