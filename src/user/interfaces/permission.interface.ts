import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';
import { IRole } from './role.interface';

export interface IPermission extends IBaseAudit {
  id: number;
  code: string; // e.g. 'user:create'
  roles: IRole[];
}
