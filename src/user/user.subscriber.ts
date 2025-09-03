import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Inject, type LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { IUser } from './interfaces/user.interface';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<IUser> {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return 'User';
  }

  beforeInsert(event: InsertEvent<IUser>) {
    this.logger.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
