import { EntitySchema } from 'typeorm';
import { IUser } from '../interfaces/user.interface';

export const UserSchema = new EntitySchema<IUser>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
