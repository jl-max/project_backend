import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1756907030287 implements MigrationInterface {
  name = 'InitSchema1756907030287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users 表
    await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` char(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`fullName\` varchar(255) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                \`created_by\` varchar(255) NULL,
                \`updated_by\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB;
        `);

    // Roles 表
    await queryRunner.query(`
            CREATE TABLE \`roles\` (
                \`id\` char(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                \`created_by\` varchar(255) NULL,
                \`updated_by\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_roles_name\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB;
        `);

    // Permissions 表
    await queryRunner.query(`
            CREATE TABLE \`permissions\` (
                \`id\` char(36) NOT NULL,
                \`action\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                \`created_by\` varchar(255) NULL,
                \`updated_by\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_permissions_action\` (\`action\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB;
        `);

    // Credentials 表
    await queryRunner.query(`
            CREATE TABLE \`credentials\` (
                \`id\` char(36) NOT NULL,
                \`passwordHash\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                \`created_by\` varchar(255) NULL,
                \`updated_by\` varchar(255) NULL,
                \`user_id\` char(36) NOT NULL UNIQUE,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_credentials_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

    // User-Roles 多对多中间表
    await queryRunner.query(`
            CREATE TABLE \`user_roles\` (
                \`user_id\` char(36) NOT NULL,
                \`role_id\` char(36) NOT NULL,
                PRIMARY KEY (\`user_id\`, \`role_id\`),
                INDEX \`IDX_user_roles_user\` (\`user_id\`),
                INDEX \`IDX_user_roles_role\` (\`role_id\`),
                CONSTRAINT \`FK_user_roles_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_user_roles_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);

    // Role-Permissions 多对多中间表
    await queryRunner.query(`
            CREATE TABLE \`role_permissions\` (
                \`role_id\` char(36) NOT NULL,
                \`permission_id\` char(36) NOT NULL,
                PRIMARY KEY (\`role_id\`, \`permission_id\`),
                INDEX \`IDX_role_permissions_role\` (\`role_id\`),
                INDEX \`IDX_role_permissions_permission\` (\`permission_id\`),
                CONSTRAINT \`FK_role_permissions_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_role_permissions_permission\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`role_permissions\``);
    await queryRunner.query(`DROP TABLE \`user_roles\``);
    await queryRunner.query(`DROP TABLE \`credentials\``);
    await queryRunner.query(`DROP TABLE \`permissions\``);
    await queryRunner.query(`DROP TABLE \`roles\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
