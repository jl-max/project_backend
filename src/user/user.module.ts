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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      RoleSchema,
      CredentialSchema,
      PermissionSchema,
    ]),
  ],
  controllers: [UserController],
  providers: [
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
