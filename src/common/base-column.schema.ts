import { EntitySchemaColumnOptions } from 'typeorm';

export const BaseColumnSchemaPart = {
  createdAt: {
    name: 'created_at',
    type: 'timestamp',
    createDate: true,
  } as EntitySchemaColumnOptions,

  updatedAt: {
    name: 'updated_at',
    type: 'timestamp',
    updateDate: true,
  } as EntitySchemaColumnOptions,

  deletedAt: {
    name: 'deleted_at',
    type: 'timestamp',
    deleteDate: true,
    nullable: true,
  } as EntitySchemaColumnOptions,

  createdBy: {
    name: 'created_by',
    type: 'varchar',
    length: 255,
    nullable: true,
  } as EntitySchemaColumnOptions,

  updatedBy: {
    name: 'updated_by',
    type: 'varchar',
    length: 255,
    nullable: true,
  } as EntitySchemaColumnOptions,
};
