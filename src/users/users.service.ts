import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/user.dto';

@Injectable()
export class UsersService {
  create(user: CreateUserDto): CreateUserDto {
    return user;
  }
}
