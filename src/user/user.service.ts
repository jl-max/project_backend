import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserSchema } from './entities/user.entity';
import { IUser } from './interfaces/user.interface';
import type { IQueryRunnerFactory } from 'src/common/interfaces/query-runner.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(UserSchema)
    private readonly usersRepo: Repository<IUser>,
    @Inject('IQueryRunnerFactory')
    private readonly qf: IQueryRunnerFactory,
  ) {}

  findAll(): Promise<IUser[]> {
    return this.usersRepo.find();
  }

  findOne(id: string): Promise<IUser | null> {
    return this.usersRepo.findOneBy({ id });
  }

  async createMany(users: IUser[]): Promise<IUser[]> {
    if (!Array.isArray(users) || users.length === 0) {
      throw new BadRequestException('users must be a non-empty array');
    }

    const queryRunner = this.qf.create();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let result: IUser[] = [];
    try {
      result = await queryRunner.manager.save(UserSchema, users);
      await queryRunner.commitTransaction();

      this.logger.log(`SUCCESS create ${result.length} users`);
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`FAIL create ${result.length} users fail`, err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }

  async removeUsers(userIds: string[]): Promise<void> {
    const queryRunner = this.qf.create();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(UserSchema, userIds);

      this.logger.log('user_delete_log', {
        userIds,
        deletedAt: new Date(),
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.log('user_delete_error', {
        userIds,
        deletedAt: new Date(),
      });
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
