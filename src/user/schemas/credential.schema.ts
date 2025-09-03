import { EntitySchema } from 'typeorm';
import { ICredential } from '../interfaces/credential.interface';
import { BaseColumnSchemaPart } from 'src/common/base-column.schema';

export const CredentialSchema = new EntitySchema<ICredential>({
  name: 'Credential',
  tableName: 'credentials',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    passwordHash: { type: String },
    ...BaseColumnSchemaPart,
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
  },
});
