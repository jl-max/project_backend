import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './schemas/user.schema';
import { RoleSchema } from './schemas/role.schema';
import { CredentialSchema } from './schemas/credential.schema';
import { PermissionSchema } from './schemas/permission.schema';

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
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
