import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from './schemas/user.schema';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSchema)
    private usersRepository: Repository<IUser>,
  ) {}

  findAll(): Promise<IUser[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<IUser | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
