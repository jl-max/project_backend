import { IBaseAudit } from 'src/common/interfaces/bash-audit.interface';

export interface ICredential extends IBaseAudit {
  id: number;
  passwordHash: string;
  salt: string;
}
