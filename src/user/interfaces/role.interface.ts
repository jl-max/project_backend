import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';
import { IPermission } from './permission.interface';

export interface IRole extends IBaseAudit {
  id: number;
  name: string;
  permissions: IPermission[];
}
