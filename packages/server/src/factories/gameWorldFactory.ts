import { createTaskQueue, TICK_RATE } from '@game/shared';
import { Entity } from './entityFactory';

export type EntityMap = Map<string, Entity>;
export type StateUpdateCallback = (
  state: Readonly<{ entities: EntityMap }>
) => void;

export const createGameWorld = () => {
  const entities = new Map<string, Entity>();
  const actionsQueue = createTaskQueue();
  const updateCallbacks = new Set<StateUpdateCallback>();
  let isRunning = false;

  const update = () => {
    actionsQueue.process();
    entities.forEach(entity => {
      entity.update();
    });
  };

  const tick = () => {
    update();
    updateCallbacks.forEach(cb => cb({ entities }));
  };

  return {
    entities,

    start() {
      if (isRunning) return;

      setInterval(tick, 1000 / TICK_RATE);
      isRunning = true;
    },

    onStateUpdate: (cb: StateUpdateCallback) => {
      updateCallbacks.add(cb);

      return () => updateCallbacks.delete(cb);
    },

    getEntityById: (id: string) => entities.get(id),

    addEntity(entity: Entity) {
      entities.set(entity.id, entity);
    }
  };
};
