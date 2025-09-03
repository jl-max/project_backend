import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';
import { IRole } from './role.interface';

export interface IPermission extends IBaseAudit {
  id: number;
  action: string;
  roles?: IRole[];
}
