import { EntitySchema } from 'typeorm';
import { ICredential } from '../interfaces/credential.interface';

export const CredentialSchema = new EntitySchema<ICredential>({
  name: 'Credential',
  tableName: 'credentials',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    passwordHash: { type: String },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
    deletedAt: { type: 'timestamp', updateDate: true },
    createdBy: { type: String, nullable: true },
    updatedBy: { type: String, nullable: true },
    version: { type: String, nullable: true },
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
  },
});
