import { EntitySchema } from 'typeorm';
import { IPermission } from '../interfaces/permission.interface';

export const PermissionSchema = new EntitySchema<IPermission>({
  name: 'Permission',
  tableName: 'permissions',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    code: {
      type: String,
      unique: true,
    },
  },
  relations: {
    roles: {
      type: 'many-to-many',
      target: 'Role',
      inverseSide: 'permissions',
    },
  },
});
