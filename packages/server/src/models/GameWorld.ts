import { TICK_RATE } from '@game/shared-domain';
import { AnyFunction, createTaskQueue, Nullable } from '@game/shared-utils';
import { LifeCyclable, withLifeCycle } from '../mixins/withLifecycle';
import { Entity } from '../models/Entity';
import { GameMap } from '../models/GameMap';

export type EntityMap = Map<string, Entity>;

const withGameWorld = <TBase extends LifeCyclable>(Base: TBase) => {
  return class GameWorld extends Base {
    private actionsQueue = createTaskQueue();

    private isRunning = false;

    private entities: EntityMap = new Map();

    tick() {
      this.actionsQueue.process();
      this.entities.forEach(entity => {
        entity.update();
      });
      this.update();
    }

    start() {
      if (this.isRunning) return;

      setInterval(this.tick.bind(this), 1000 / TICK_RATE);

      this.isRunning = true;
    }

    addEntity<T extends Entity>(entity: T) {
      entity.on('destroy', () => {
        this.entities.delete(entity.id);
      });

      this.entities.set(entity.id, entity);

      return entity;
    }

    getEntity<T extends Entity = Entity>(id: string): Nullable<T> {
      const entity = this.entities.get(id);

      if (!entity) return null;

      return entity as T;
    }

    scheduleAction(action: AnyFunction) {
      this.actionsQueue.schedule(action);
    }
  };
};

class GameWorldBase {
  constructor(public map: GameMap) {}
}
export const GameWorld = withGameWorld(withLifeCycle(GameWorldBase));
export type GameWorld = InstanceType<typeof GameWorld>;
