import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';
import { IPermission } from './permission.interface';
import { IUser } from './user.interface';

export interface IRole extends IBaseAudit {
  id: number;
  name: string;
  users?: IUser[];
  permissions?: IPermission[];
}
