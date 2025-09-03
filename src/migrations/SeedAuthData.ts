import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserSchema } from '../user/schemas/user.schema';
import { RoleSchema } from '../user/schemas/role.schema';
import { PermissionSchema } from '../user/schemas/permission.schema';
import { CredentialSchema } from '../user/schemas/credential.schema';

export class SeedAuthData1856907030289 implements MigrationInterface {
  name = 'SeedAuthData1856907030289';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepo = queryRunner.manager.getRepository(UserSchema);
    const roleRepo = queryRunner.manager.getRepository(RoleSchema);
    const permRepo = queryRunner.manager.getRepository(PermissionSchema);
    const credRepo = queryRunner.manager.getRepository(CredentialSchema);

    // 1. 插入权限
    const permissions = await permRepo.save([
      { action: 'read' },
      { action: 'write' },
      { action: 'delete' },
    ]);

    // 2. 插入角色
    const adminRole = roleRepo.create({
      name: 'admin',
      permissions,
    });
    const userRole = roleRepo.create({
      name: 'user',
      permissions: permissions.filter((p) => p.action === 'read'),
    });
    await roleRepo.save([adminRole, userRole]);

    // 3. 插入用户
    const adminUser = userRepo.create({
      fullName: 'Jane Doe',
      roles: [adminRole],
    });
    const normalUser = userRepo.create({
      fullName: 'John Doe',
      roles: [userRole],
    });
    await userRepo.save([adminUser, normalUser]);

    // 4. 插入凭据（这里假设直接存 hash）
    await credRepo.save([
      { passwordHash: 'hashed_admin_pw', user: adminUser },
      { passwordHash: 'hashed_user_pw', user: normalUser },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "credentials"`);
    await queryRunner.query(`DELETE FROM "user_roles"`);
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(`DELETE FROM "users"`);
    await queryRunner.query(`DELETE FROM "roles"`);
    await queryRunner.query(`DELETE FROM "permissions"`);
  }
}
