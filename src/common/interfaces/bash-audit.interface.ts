export interface IBaseAudit {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}
