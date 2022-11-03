import {
  ActionPayload,
  OngoingActionStartPayload,
  TICK_RATE
} from '@game/shared-domain';
import { createTaskQueue } from '@game/shared-utils';
import { Entity } from './entity';
import { GameMap } from './gameMap';
import { Player } from './player';

export type EntityMap = Map<string, Entity>;
export type StateUpdateCallback = (
  state: Readonly<{ entities: EntityMap }>
) => void;

export type OngoingActionKey = `${string}.${string}`;

export type GameAction = ActionPayload & { player: Player };
export type GameOngoingAction = OngoingActionStartPayload & { player: Player };

export type CreateGameWorldOptions = {
  map: GameMap;
};

export const createGameWorld = ({ map }: CreateGameWorldOptions) => {
  const entities = new Map<string, Entity>();
  const actionsQueue = createTaskQueue();
  const ongoingActionsQueue = createTaskQueue();
  const ongoingActions = new Map<string, () => void>();
  const updateCallbacks = new Set<StateUpdateCallback>();
  let isRunning = false;

  const update = () => {
    ongoingActions.forEach(action => {
      ongoingActionsQueue.schedule(action);
    });
    actionsQueue.process();
    ongoingActionsQueue.process();
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
    },

    addOngoingAction: (actionKey: string, action: () => void) => {
      ongoingActions.set(actionKey, action);
    },

    stopOngoingAction: (actionKey: string) => {
      ongoingActions.delete(actionKey);
    }
  };
};

export type GameWorld = ReturnType<typeof createGameWorld>;
