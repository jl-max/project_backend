import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserSchema } from './entities/user.entity';
import { IUser, SafeUser } from './interfaces/user.interface';
import type { IQueryRunnerFactory } from 'src/common/interfaces/query-runner.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { IRole } from './interfaces/role.interface';
import { CredentialSchema } from './entities/credential.entity';
import { RoleSchema } from './entities/role.entity';
import { ICredential } from './interfaces/credential.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(UserSchema)
    private readonly usersRepo: Repository<IUser>,
    @Inject('IQueryRunnerFactory')
    private readonly qf: IQueryRunnerFactory,
    @InjectRepository(CredentialSchema)
    private readonly credRepo: Repository<ICredential>,
    @InjectRepository(RoleSchema)
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
      relations: ['credential', 'roles'],
    });
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 2. 先存 credential
    const credential = this.credRepo.create({
      passwordHash,
    });
    const savedCred = await this.credRepo.save(credential);

    // 3. 查询角色实体（前端只传 id 或 name）
    const roles = await this.roleRepo.find({
      where: { id: In(dto.roles.map((r) => r.id)) },
    });

    const user = this.usersRepo.create({
      email: dto.email,
      fullName: dto.fullName,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy,
      credential: savedCred,
      roles,
    });
    const savedUser = await this.usersRepo.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credential: _, ...safeUser } = savedUser;
    return safeUser as SafeUser;
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
