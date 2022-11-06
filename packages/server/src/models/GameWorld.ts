import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { TICK_RATE } from '@game/shared-domain';
import { AnyFunction, createTaskQueue, Nullable } from '@game/shared-utils';
import { Entity } from '../models/Entity';
import { GameMap } from '../models/GameMap';

export type EntityMap = Map<string, Entity>;

export type GameWorldEvents = {
  update: (state: Readonly<{ entities: EntityMap }>) => void;
  message: (body: string, from: string) => void;
};

export type GameWorldEmitter = TypedEmitter<GameWorldEvents>;

export class GameWorld {
  private actionsQueue = createTaskQueue();

  private emitter = new EventEmitter() as GameWorldEmitter;

  private isRunning = false;

  private entities: EntityMap = new Map();

  constructor(public map: GameMap) {}

  private update() {
    this.actionsQueue.process();
    this.entities.forEach(entity => {
      entity.update();
    });
  }

  tick() {
    this.update();
    this.emitter.emit('update', { entities: this.entities });
  }

  on<E extends keyof GameWorldEvents>(event: E, listener: GameWorldEvents[E]) {
    this.emitter.on(event, listener);
    return this;
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
}
