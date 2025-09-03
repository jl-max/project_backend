/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository, QueryRunner, In, DataSource } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { UserService } from './user.service';
import { UserSchema } from './entities/user.entity';
import { IUser, SafeUser } from './interfaces/user.interface';
import { ICredential } from './interfaces/credential.interface';
import { IRole } from './interfaces/role.interface';
import { IQueryRunnerFactory } from 'src/common/interfaces/query-runner.interface';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

type MockRepository<T extends Record<string, any> = any> = {
  [P in keyof Repository<T>]: jest.Mock;
};

const mockRepository = <
  T extends Record<string, any> = any,
>(): MockRepository<T> =>
  ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  }) as MockRepository<T>;

const qr = createMock<QueryRunner>({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    save: jest.fn(),
    delete: jest.fn(),
  } as any,
});

const qf = createMock<IQueryRunnerFactory>({
  create: jest.fn().mockReturnValue(qr),
});

describe('UserService', () => {
  let service: UserService;
  let userRepo: MockRepository<IUser>;
  let credRepo: MockRepository<ICredential>;
  let roleRepo: MockRepository<IRole>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'ROLE_REPO',
          useValue: mockRepository<IRole>(),
        },
        {
          provide: 'USER_REPO',
          useValue: mockRepository<IUser>(),
        },
        {
          provide: 'CREDENTIAL_REPO',
          useValue: mockRepository<ICredential>(),
        },
        {
          provide: DataSource,
          useValue: createMock<DataSource>({
            getRepository: jest.fn().mockImplementation((entityName) => {
              switch (entityName) {
                case 'Role':
                  return mockRepository<IRole>();
                case 'User':
                  return mockRepository<IUser>();
                case 'Credential':
                  return mockRepository<ICredential>();
                default:
                  return mockRepository();
              }
            }),
          }),
        },
        { provide: 'IQueryRunnerFactory', useValue: qf },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get('USER_REPO');
    credRepo = module.get('CREDENTIAL_REPO');
    roleRepo = module.get('ROLE_REPO');

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: IUser[] = [{ id: '1', fullName: 'Alice Wang' } as any];
      jest.spyOn(userRepo, 'find').mockResolvedValue(users);

      const res = await service.findAll();
      expect(res).toEqual(users);
      expect(userRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should return a user when a valid id is provided', async () => {
      const userId = '123';
      const mockUser: IUser = { id: userId, fullName: 'John Doe' } as any;
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(mockUser);

      const result = await service.findOneById(userId);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const userId = 'non-existent-id';
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);

      const result = await service.findOneById(userId);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user when a valid email is provided', async () => {
      const email = '123@qq.com';
      const mockUser: IUser = { email: email, fullName: 'John Doe' } as any;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);
      expect(userRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: email } }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when email is not found', async () => {
      const email = 'non-existent-email';
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      const result = await service.findOneByEmail(email);
      expect(userRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: email } }),
      );
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should call the repository delete method with the correct id', async () => {
      const userId = '456';
      jest.spyOn(userRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(userId);
      expect(userRepo.delete).toHaveBeenCalledWith(userId);
      expect(userRepo.delete).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors if the repository delete method fails', async () => {
      const userId = '789';
      const dbError = new Error('Database connection lost');
      jest.spyOn(userRepo, 'delete').mockRejectedValue(dbError);

      await expect(service.remove(userId)).rejects.toThrow(dbError);
      expect(userRepo.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    it('should create user & return SafeUser', async () => {
      const dto: CreateUserDto = {
        email: 'a@b.com',
        fullName: 'Alice',
        password: 'plain',
        roles: [{ id: 1 }, { id: 2 }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 模拟 userRepo 返回值
      const savedCred = { id: 99, passwordHash: 'hashed_pw' };
      credRepo.save.mockResolvedValue(savedCred as any);

      const roles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' },
      ];
      roleRepo.find.mockResolvedValue(roles as any);

      const savedUser = {
        id: 'uuid-123',
        email: dto.email,
        fullName: dto.fullName,
        isActive: true,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        credential: savedCred,
        roles,
      };
      userRepo.save.mockResolvedValue(savedUser as any);

      // 执行
      const result: SafeUser = await service.create(dto);

      // 断言
      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(roleRepo.find).toHaveBeenCalledWith({ where: { id: In([1, 2]) } });
      expect(result).toEqual({
        id: 'uuid-123',
        email: 'a@b.com',
        fullName: 'Alice',
        isActive: true,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        roles,
      });
      expect(result).not.toHaveProperty('credential');
    });
  });

  describe('createBulk', () => {
    it('should throw when empty array', async () => {
      await expect(service.createBulk([])).rejects.toThrow(BadRequestException);
    });

    it('should commit when all succeed', async () => {
      const users: IUser[] = [{ fullName: 'A' }, { fullName: 'B' }] as any;
      jest.spyOn(qr.manager, 'save').mockResolvedValue(users as any);

      const res = await service.createBulk(users);

      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.save).toHaveBeenCalledWith(UserSchema, users);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
      expect(res).toEqual(users);
    });

    it('should rollback on error', async () => {
      const users: IUser[] = [{ fullName: 'A' }] as any;
      jest.spyOn(qr.manager, 'save').mockRejectedValue(new Error('DB Error'));

      await expect(service.createBulk(users)).rejects.toThrow('DB Error');
      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });
  });

  describe('removeUsers', () => {
    it('should delete users and commit', async () => {
      const ids = ['1', '2'];
      jest
        .spyOn(qr.manager, 'delete')
        .mockResolvedValue({ affected: 2 } as any);

      await service.removeUsers(ids);

      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.delete).toHaveBeenCalledWith(UserSchema, ids);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const ids = ['1'];
      jest.spyOn(qr.manager, 'delete').mockRejectedValue(new Error('DB Error'));

      await expect(service.removeUsers(ids)).rejects.toThrow('DB Error');
      expect(qr.rollbackTransaction).toHaveBeenCalled();
      expect(qr.release).toHaveBeenCalled();
    });
  });
});
