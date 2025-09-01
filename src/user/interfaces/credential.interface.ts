import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';
import { IUser } from './user.interface';

export interface ICredential extends IBaseAudit {
  id: number;
  passwordHash: string;
  salt: string;
  user: IUser;
}
