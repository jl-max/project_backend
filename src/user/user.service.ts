import { Injectable } from '@nestjs/common';
import {
  CreateUserData,
  UpdateUserData,
  User,
} from './interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly users: User[] = [];
  private idCounter = 1;

  create(createUserData: CreateUserData) {
    const user: User = {
      id: this.idCounter++,
      ...createUserData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll() {
    return this.users;
  }

  findByIds(ids: number[]) {
    return `This action returns #${ids.length} users`;
  }

  findAllByRole(role: string) {
    return `This action returns a #${role} user`;
  }
  findAllByEmail(email: string) {
    return `This action returns a #${email} user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, changes: UpdateUserData) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
