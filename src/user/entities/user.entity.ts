import { EntitySchema } from 'typeorm';
import { IUser } from '../interfaces/user.interface';

export const UserSchema = new EntitySchema<IUser>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    email: { type: String, unique: true },
    fullName: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
    deletedAt: { type: 'timestamp', updateDate: true },
    createdBy: { type: String, nullable: true },
    updatedBy: { type: String, nullable: true },
    version: { type: String, nullable: true },
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
