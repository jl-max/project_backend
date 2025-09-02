import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { IUser } from './interfaces/user.interface';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<IUser> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return 'User';
  }

  beforeInsert(event: InsertEvent<IUser>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
