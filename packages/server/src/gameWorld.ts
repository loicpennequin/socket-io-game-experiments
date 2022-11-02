import {
  PlayerAction,
  TICK_RATE,
  PLAYER_FIELD_OF_VIEW,
  ActionPayload,
  FireProjectileActionPayload,
  PROJECTILE_FIELD_OF_VIEW,
  uniqBy,
  TaskQueue,
  createTaskQueue
} from '@game/shared';
import { v4 as uuid } from 'uuid';
import { gameMap } from './gameMap';
import { createPlayer, Player } from './factories/playerFactory';
import { createProjectile, Projectile } from './factories/projectileFactory';
import { Entity } from './factories/entityFactory';
import { isProjectile } from './utils';

export type GameStateAction = ActionPayload & { player: Player };
export type GameState = {
  entities: Record<string, Player | Projectile>;
  actionsQueue: TaskQueue;
};
export type StateUpdateCallback = (state: Readonly<GameState>) => void;

const getPlayerProjectiles = (player: Player) =>
  Object.values(gameState.entities).filter(
    entity => isProjectile(entity) && entity.player === player
  );

const getPlayerDiscoveredCells = (player: Player) => {
  const cells = Array.from(player.newDiscoveredCells.values());
  player.newDiscoveredCells.clear();
  return cells;
};

const getEntityFieldOfView = (entity: Entity, fov: number) =>
  gameMap.grid
    .findNearbyRadius(entity.gridItem.position, fov)
    .map(gridItem => gameState.entities[gridItem.meta.id]);

const gameState: GameState = {
  entities: {},
  actionsQueue: createTaskQueue()
};
let isRunning = false;

const fireProjectile = ({
  meta: { target },
  player
}: FireProjectileActionPayload & { player: Player }) => {
  const projectile = createProjectile({
    id: uuid(),
    target,
    player
  }).on('destroy', () => {
    delete gameState.entities[projectile.id];
  });

  gameState.entities[projectile.id] = projectile as Projectile; // @fixme should get fixed when solidify object composition
};

const updateGameState = () => {
  gameState.actionsQueue.process();
  Object.values(gameState.entities).forEach(entity => {
    entity.update();
  });
};

const updateCallbacks = new Set<StateUpdateCallback>();

export const gameWorld = {
  start: () => {
    if (isRunning) return;

    setInterval(() => {
      updateGameState();
      updateCallbacks.forEach(cb => cb(gameState));
    }, 1000 / TICK_RATE);
    isRunning = true;
  },

  onStateUpdate: (cb: StateUpdateCallback) => {
    updateCallbacks.add(cb);

    return () => updateCallbacks.delete(cb);
  },

  getEntityById: (id: string) => gameState.entities[id],

  addPlayer: (socketId: string) => {
    const player = createPlayer({ id: socketId });
    gameState.entities[socketId] = player;

    return player;
  },

  removePlayer: (player: Player) => {
    delete gameState.entities[player.id];
  },

  getPlayerFieldOFView: (player: Player) => {
    const playerFov = getEntityFieldOfView(player, PLAYER_FIELD_OF_VIEW);
    const projectilesFov = getPlayerProjectiles(player).map(projectile =>
      getEntityFieldOfView(projectile, PROJECTILE_FIELD_OF_VIEW)
    );

    return uniqBy([playerFov, projectilesFov].flat(2), entity => entity.id);
  },

  getPlayerDiscoveredCells: (player: Player) =>
    uniqBy(
      getPlayerDiscoveredCells(player).flat(),
      cell => `${cell.x}.${cell.y}`
    ),

  addAction(action: GameStateAction) {
    gameState.actionsQueue.schedule(() => {
      switch (action.action) {
        case PlayerAction.FIRE_PROJECTILE:
          fireProjectile(action);
      }
    });
  }
};
