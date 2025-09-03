import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './entities/user.entity';
import { RoleSchema } from './entities/role.entity';
import { CredentialSchema } from './entities/credential.entity';
import { PermissionSchema } from './entities/permission.entity';
import { QueryRunnerFactory } from 'src/common/factories/query-runner.factory';
import { UserSubscriber } from './user.subscriber';
import { DataSource } from 'typeorm';
import { IRole } from './interfaces/role.interface';
import { IUser } from './interfaces/user.interface';
import { ICredential } from './interfaces/credential.interface';
import { IPermission } from './interfaces/permission.interface';

TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    entities: [UserSchema, RoleSchema, CredentialSchema, PermissionSchema],
    subscribers: [UserSubscriber],
    synchronize: true,
  }),
});

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [UserController],
  providers: [
    {
      provide: 'USER_REPO',
      useFactory: (ds: DataSource) => ds.getRepository<IUser>('User'),
      inject: [DataSource],
    },
    {
      provide: 'ROLE_REPO',
      useFactory: (ds: DataSource) => ds.getRepository<IRole>('Role'),
      inject: [DataSource],
    },
    {
      provide: 'CREDENTIAL_REPO',
      useFactory: (ds: DataSource) =>
        ds.getRepository<ICredential>('Credential'),
      inject: [DataSource],
    },
    {
      provide: 'PERMISSION_REPO',
      useFactory: (ds: DataSource) =>
        ds.getRepository<IPermission>('Permission'),
      inject: [DataSource],
    },
    UserService,
    UserSubscriber,
    {
      provide: 'IQueryRunnerFactory',
      useClass: QueryRunnerFactory,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
