import { ActionPayload, TICK_RATE } from '@game/shared-domain';
import { createTaskQueue } from '@game/shared-utils';
import { Entity } from './entity';
import { GameMap } from './gameMap';
import { Player } from './player';

export type EntityMap = Map<string, Entity>;
export type StateUpdateCallback = (
  state: Readonly<{ entities: EntityMap }>
) => void;

export type GameAction = ActionPayload & { player: Player };

export type CreateGameWorldOptions = {
  map: GameMap;
};

export const createGameWorld = ({ map }: CreateGameWorldOptions) => {
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
    // const start = performance.now();
    update();
    updateCallbacks.forEach(cb => cb({ entities }));
    // const now = performance.now();
    // console.log(`tick duration : ${now - start}ms`);
  };

  return {
    entities,
    map,

    start() {
      if (isRunning) return;

      setInterval(tick, 1000 / TICK_RATE);
      isRunning = true;
    },

    onStateUpdate: (cb: StateUpdateCallback) => {
      updateCallbacks.add(cb);

      return () => updateCallbacks.delete(cb);
    },

    addEntity: <T extends Entity>(entity: T) => {
      entity.on('destroy', () => {
        entities.delete(entity.id);
      });
      entities.set(entity.id, entity);

      return entity;
    },

    addAction: (action: () => void) => {
      actionsQueue.schedule(action);
    }
  };
};

export type GameWorld = ReturnType<typeof createGameWorld>;
