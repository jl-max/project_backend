import { EntitySchema } from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { BaseColumnSchemaPart } from '../../common/base-column.schema';

export const UserSchema = new EntitySchema<IUser>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    email: { type: String, unique: true },
    fullName: { type: String },
    isActive: { type: Boolean, default: true },
    ...BaseColumnSchemaPart,
  },
  relations: {
    credential: {
      type: 'one-to-one',
      target: 'Credential',
      inverseSide: 'user',
    },
    roles: {
      type: 'many-to-many',
      target: 'Role',
      joinTable: {
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
      },
    },
  },
});
