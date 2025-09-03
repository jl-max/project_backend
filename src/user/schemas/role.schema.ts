import { EntitySchema } from 'typeorm';
import { IRole } from '../interfaces/role.interface';
import { BaseColumnSchemaPart } from '../../common/base-column.schema';

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
      joinTable: {
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: {
          name: 'permission_id',
          referencedColumnName: 'id',
        },
      },
    },
  },
});
