import {
  BadRequestException,
  Inject,
  Injectable,
  type LoggerService,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { IUser, SafeUser } from './interfaces/user.interface';
import { IRole } from './interfaces/role.interface';
import { ICredential } from './interfaces/credential.interface';
import type { IQueryRunnerFactory } from 'src/common/interfaces/query-runner.interface';
import { UserSchema } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @Inject('IQueryRunnerFactory')
    private readonly qf: IQueryRunnerFactory,
    @Inject('USER_REPO')
    private readonly usersRepo: Repository<IUser>,
    @Inject('CREDENTIAL_REPO')
    private readonly credRepo: Repository<ICredential>,
    @Inject('ROLE_REPO')
    private readonly roleRepo: Repository<IRole>,
  ) {}

  findAll(): Promise<IUser[]> {
    return this.usersRepo.find();
  }

  findOneById(id: string): Promise<IUser | null> {
    return this.usersRepo.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<IUser | null> {
    return this.usersRepo.findOne({
      where: { email },
    });
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const credential = this.credRepo.create({
      passwordHash,
    });
    const savedCred = await this.credRepo.save(credential);

    // Retrieve the complete Role entity and then associate it
    const roles = await this.roleRepo.find({
      where: { id: 0 },
    });

    const user = this.usersRepo.create({
      email: dto.email,
      fullName: dto.fullName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: undefined,
      credential: savedCred,
      roles,
    });
    const savedUser = await this.usersRepo.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credential: _, ...safeUser } = savedUser;
    return safeUser as SafeUser;
  }

  async createBulk(users: IUser[]): Promise<IUser[]> {
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
