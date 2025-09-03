/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryRunner, EntityManager } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';

import { UserService } from './user.service';
import { UserSchema } from './entities/user.entity';
import { IUser } from './interfaces/user.interface';
import { IQueryRunnerFactory } from 'src/common/interfaces/query-runner.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<IUser>;
  let qf: IQueryRunnerFactory;
  let qr: QueryRunner;

  beforeEach(async () => {
    qr = createMock<QueryRunner>({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: createMock<EntityManager>({
        save: jest.fn(),
        getRepository: jest
          .fn()
          .mockReturnValue(createMock<Repository<IUser>>()),
        delete: jest.fn(),
      }),
    });

    qf = createMock<IQueryRunnerFactory>({
      create: jest.fn().mockReturnValue(qr),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserSchema),
          useValue: createMock<Repository<IUser>>(),
        },
        { provide: 'IQueryRunnerFactory', useValue: qf },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<IUser>>(getRepositoryToken(UserSchema));
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: IUser[] = [{ id: '1', fullName: 'Alice Wang' } as any];
      jest.spyOn(repo, 'find').mockResolvedValue(users);

      const res = await service.findAll();
      expect(res).toEqual(users);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should return a user when a valid id is provided', async () => {
      const userId = '123';
      const mockUser: IUser = { id: userId, fullName: 'John Doe' } as any;
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(mockUser);

      const result = await service.findOneById(userId);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const userId = 'non-existent-id';
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

      const result = await service.findOneById(userId);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should call the repository delete method with the correct id', async () => {
      const userId = '456';
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(userId);
      expect(repo.delete).toHaveBeenCalledWith(userId);
      expect(repo.delete).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors if the repository delete method fails', async () => {
      const userId = '789';
      const dbError = new Error('Database connection lost');
      jest.spyOn(repo, 'delete').mockRejectedValue(dbError);

      await expect(service.remove(userId)).rejects.toThrow(dbError);
      expect(repo.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('createMany', () => {
    it('should throw when empty array', async () => {
      await expect(service.createMany([])).rejects.toThrow(BadRequestException);
    });

    it('should commit when all succeed', async () => {
      const users: IUser[] = [{ fullName: 'A' }, { fullName: 'B' }] as any;
      jest.spyOn(qr.manager, 'save').mockResolvedValue(users as any);

      const res = await service.createMany(users);

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

      await expect(service.createMany(users)).rejects.toThrow('DB Error');
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
