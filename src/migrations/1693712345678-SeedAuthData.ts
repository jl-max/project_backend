import { type MigrationInterface, type QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class SeedAuthData1693712345678 implements MigrationInterface {
  name = 'SeedAuthData1693712345678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ 插入角色
    await queryRunner.query(`
      INSERT INTO roles (name, created_at, updated_at)
      VALUES ('admin', NOW(), NOW())
    `);
    const [adminRole] = (await queryRunner.query(
      `SELECT id FROM roles WHERE name = 'admin'`,
    )) as { id: number }[];

    // 2️⃣ 插入权限
    await queryRunner.query(`
      INSERT INTO permissions (action, created_at, updated_at)
      VALUES ('manage_users', NOW(), NOW()), ('manage_roles', NOW(), NOW())
    `);
    const permissions = (await queryRunner.query(
      `SELECT id FROM permissions`,
    )) as { id: number }[];

    // 3️⃣ 角色-权限关联
    for (const perm of permissions) {
      await queryRunner.query(`
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES (${adminRole.id}, ${perm.id})
      `);
    }

    // 4️⃣ 插入用户
    const adminUserId = uuidv4();
    await queryRunner.query(`
      INSERT INTO users (id, email, fullName, isActive, created_at, updated_at)
      VALUES ('${adminUserId}', 'admin@example.com', 'Admin', 1, NOW(), NOW())
    `);

    // 5️⃣ 用户-角色关联
    await queryRunner.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ('${adminUserId}', ${adminRole.id})
    `);

    // 6️⃣ 插入凭证（一对一）
    const passwordHash = '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // bcrypt hash 示例
    await queryRunner.query(`
      INSERT INTO credentials (passwordHash, user_id, created_at, updated_at)
      VALUES ('${passwordHash}', '${adminUserId}', NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 注意删除顺序，避免外键冲突
    await queryRunner.query(`DELETE FROM credentials`);
    await queryRunner.query(`DELETE FROM user_roles`);
    await queryRunner.query(`DELETE FROM role_permissions`);
    await queryRunner.query(`DELETE FROM users`);
    await queryRunner.query(`DELETE FROM roles`);
    await queryRunner.query(`DELETE FROM permissions`);
  }
}
