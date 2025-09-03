import { EntitySchema } from 'typeorm';
import { IPermission } from '../interfaces/permission.interface';

export const PermissionSchema = new EntitySchema<IPermission>({
  name: 'Permission',
  tableName: 'permissions',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    code: { type: String, unique: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
    deletedAt: { type: 'timestamp', updateDate: true },
    createdBy: { type: String, nullable: true },
    updatedBy: { type: String, nullable: true },
    version: { type: String, nullable: true },
  },
  relations: {
    roles: {
      type: 'many-to-many',
      target: 'Role',
      inverseSide: 'permissions',
    },
  },
});
