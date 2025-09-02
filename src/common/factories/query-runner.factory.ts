import { Injectable } from '@nestjs/common';
import { IQueryRunnerFactory } from '../interfaces/query-runner.interface';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class QueryRunnerFactory implements IQueryRunnerFactory {
  constructor(private dataSource: DataSource) {}
  create(): QueryRunner {
    return this.dataSource.createQueryRunner();
  }
}
