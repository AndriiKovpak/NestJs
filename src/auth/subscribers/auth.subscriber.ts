import { UserEntity } from '#entity/user';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { AuthProvider } from '../providers/auth.provider';

@EventSubscriber()
export class AuthSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): string | Function {
    return UserEntity;
  }

  async beforeInsert({ entity }: InsertEvent<UserEntity>): Promise<void> {
    if (entity.password) {
      entity.password = await AuthProvider.generateHash(entity.password);
    }

    if (entity.email) {
      entity.email = entity.email.toLowerCase();
    }
  }

  async beforeUpdate({ entity, databaseEntity }: UpdateEvent<UserEntity>): Promise<void> {
    if (entity && entity['password']) {
      const password = await AuthProvider.generateHash(entity['password']);
      if (password !== databaseEntity.password) {
        // entity['password'] = password;
      }
    }
  }
}
