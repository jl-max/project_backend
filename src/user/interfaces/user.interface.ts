import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';
import { ICredential } from './credential.interface';
import { IRole } from './role.interface';

export interface IUser extends IBaseAudit {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  credential: ICredential;
  roles: IRole[];
}

export type CreateUserData = Omit<IUser, 'id'>;

export type UpdateUserData = Partial<Omit<IUser, 'id'>>;
