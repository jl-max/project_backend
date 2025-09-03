import { EntitySchema } from 'typeorm';
import { IPermission } from '../interfaces/permission.interface';
import { BaseColumnSchemaPart } from '../../common/base-column.schema';

export const PermissionSchema = new EntitySchema<IPermission>({
  name: 'Permission',
  tableName: 'permissions',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    action: { type: String, unique: true },
    ...BaseColumnSchemaPart,
  },
  relations: {
    roles: {
      type: 'many-to-many',
      target: 'Role',
      inverseSide: 'permissions',
    },
  },
});
