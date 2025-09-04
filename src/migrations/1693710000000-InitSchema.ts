import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class InitSchema1693710000000 implements MigrationInterface {
  name = 'InitSchema1693710000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users 表
    await queryRunner.query(`
      CREATE TABLE users (
        id CHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        fullName VARCHAR(255) NOT NULL,
        isActive TINYINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMP(6) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Roles 表
    await queryRunner.query(`
      CREATE TABLE roles (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMP(6) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Permissions 表
    await queryRunner.query(`
      CREATE TABLE permissions (
        id INT NOT NULL AUTO_INCREMENT,
        action VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMP(6) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Credentials 表 (一对一: user_id 唯一)
    await queryRunner.query(`
      CREATE TABLE credentials (
        id INT NOT NULL AUTO_INCREMENT,
        passwordHash VARCHAR(255) NOT NULL,
        user_id CHAR(36) NULL UNIQUE,
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at TIMESTAMP(6) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        PRIMARY KEY (id),
        CONSTRAINT FK_credentials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    // User-Roles 多对多
    await queryRunner.query(`
      CREATE TABLE user_roles (
        user_id CHAR(36) NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        CONSTRAINT FK_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    // Role-Permissions 多对多
    await queryRunner.query(`
      CREATE TABLE role_permissions (
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        CONSTRAINT FK_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE role_permissions`);
    await queryRunner.query(`DROP TABLE user_roles`);
    await queryRunner.query(`DROP TABLE credentials`);
    await queryRunner.query(`DROP TABLE permissions`);
    await queryRunner.query(`DROP TABLE roles`);
    await queryRunner.query(`DROP TABLE users`);
  }
}
