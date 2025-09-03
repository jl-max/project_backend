import { EntitySchema } from 'typeorm';
import { IRole } from '../interfaces/role.interface';

export const RoleSchema = new EntitySchema<IRole>({
  name: 'Role',
  tableName: 'roles',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    name: { type: String, unique: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
    deletedAt: { type: 'timestamp', updateDate: true },
    createdBy: { type: String, nullable: true },
    updatedBy: { type: String, nullable: true },
    version: { type: String, nullable: true },
  },
  relations: {
    users: {
      type: 'many-to-many',
      target: 'User',
      inverseSide: 'roles',
    },
    permissions: {
      type: 'many-to-many',
      target: 'Permission',
      inverseSide: 'roles',
      joinTable: { name: 'role_permissions' },
      cascade: true,
    },
  },
});
