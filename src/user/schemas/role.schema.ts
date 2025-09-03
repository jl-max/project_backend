import { EntitySchema } from 'typeorm';
import { IRole } from '../interfaces/role.interface';
import { BaseColumnSchemaPart } from 'src/common/base-column.schema';

export const RoleSchema = new EntitySchema<IRole>({
  name: 'Role',
  tableName: 'roles',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    name: { type: String, unique: true },
    ...BaseColumnSchemaPart,
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
