import { EntitySchema } from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { BaseColumnSchemaPart } from 'src/common/base-column.schema';

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
      cascade: true,
    },
    roles: {
      type: 'many-to-many',
      target: 'Role',
      inverseSide: 'users',
      joinTable: {
        name: 'user_roles',
      },
    },
  },
});
