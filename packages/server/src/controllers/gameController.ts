import {
  Coordinates,
  GRID_SIZE,
  CELL_SIZE,
  PlayerAction,
  PLAYER_SPEED,
  PLAYER_SIZE,
  TICK_RATE,
  PLAYER_FIELD_OF_VIEW,
  clamp,
  GameMapCell,
  OngoingAction,
  ActionPayload,
  FireProjectileActionPayload,
  EntityType,
  PROJECTILE_SIZE,
  PROJECTILE_LIFESPAN,
  PROJECTILE_SPEED,
  getAngleFromVector,
  PROJECTILE_FIELD_OF_VIEW,
  uniqBy,
  randomInt,
  EntityDto
} from '@game/shared';
import { v4 as uuid } from 'uuid';
import { performance } from 'perf_hooks';
import { mapController, MapGridItem } from './mapController';
import { makePlayer, Player } from '../factories/playerFactory';
import { makeProjectile, Projectile } from '../factories/projectileFactory';
import { Entity } from '../factories/entityFactory';

export type GameStateAction = ActionPayload & { player: Player };

export type GameState = {
  entities: Record<string, Player | Projectile>;
  actionsQueue: GameStateAction[];
};

export type StateUpdateCallback = (state: Readonly<GameState>) => void;

export const isPlayer = (entity: Entity): entity is Player =>
  entity.type === EntityType.PLAYER;
export const isProjectile = (entity: Entity): entity is Projectile =>
  entity.type === EntityType.PROJECTILE;

let isRunning = false;

const gameState: GameState = {
  entities: {},
  actionsQueue: []
};

const fireProjectile = ({
  meta: { target },
  player
}: FireProjectileActionPayload & { player: Player }) => {
  const projectile = makeProjectile({ id: uuid(), target, player });
  gameState.entities[projectile.id] = projectile;
};

const processActionQueue = () => {
  let action = gameState.actionsQueue.shift();
  while (action) {
    switch (action.action) {
      case PlayerAction.FIRE_PROJECTILE:
        fireProjectile(action);
    }

    action = gameState.actionsQueue.shift();
  }
};

const updateEntities = () => {
  Object.values(gameState.entities).forEach(entity => {
    entity.update();
  });
};

const updateGameState = () => {
  processActionQueue();
  updateEntities();
};

const cleanupPlayer = (player: Player) => {
  player.newDiscoveredCells.clear();
};

const cleanupProjectile = (projectile: Projectile) => {
  if (projectile.lifeSpan <= 0) {
    mapController.grid.remove(projectile.gridItem);
    delete gameState.entities[projectile.id];
    return;
  }
};

const cleanupState = () => {
  Object.values(gameState.entities).forEach(entity => {
    if (isPlayer(entity)) {
      cleanupPlayer(entity);
    } else if (isProjectile(entity)) {
      cleanupProjectile(entity);
    }
  });
};

const getPlayerProjectiles = (player: Player) =>
  Object.values(gameState.entities).filter(
    entity => isProjectile(entity) && entity.player === player
  );

const getPlayerDiscoveredCells = (player: Player) =>
  Array.from(player.newDiscoveredCells.values());

const getEntityFieldOfView = (entity: Entity, fov: number) =>
  mapController.grid
    .findNearbyRadius(entity.gridItem.position, fov)
    .map(gridItem => gameState.entities[gridItem.meta.id]);

const updateCallbacks = new Set<StateUpdateCallback>();

export const gameController = {
  get gameState() {
    return gameState as Readonly<GameState>;
  },

  start: () => {
    if (isRunning) return;
    let lastTick = 0;

    setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTick;
      lastTick = now;

      updateGameState();
      updateCallbacks.forEach(cb => cb(gameState));
      cleanupState();
    }, 1000 / TICK_RATE);
    isRunning = true;
  },

  onStateUpdate: (cb: StateUpdateCallback) => {
    updateCallbacks.add(cb);

    return () => updateCallbacks.delete(cb);
  },

  getEntityById: (id: string) => gameState.entities[id],

  addPlayer: (socketId: string) => {
    const player = makePlayer({ id: socketId });
    gameState.entities[socketId] = player;

    return player;
  },

  removePlayer: (player: Player) => {
    mapController.grid.remove(player.gridItem);
    delete gameState.entities[player.id];
  },

  getPlayerFieldOFView: (player: Player): EntityDto[] => {
    const playerFov = getEntityFieldOfView(player, PLAYER_FIELD_OF_VIEW);
    const projectilesFov = getPlayerProjectiles(player).map(projectile =>
      getEntityFieldOfView(projectile, PROJECTILE_FIELD_OF_VIEW)
    );

    return uniqBy([playerFov, projectilesFov].flat(2), entity => entity.id).map(
      entity => ({
        ...entity.gridItem.position,
        id: entity.id,
        type: entity.type
      })
    );
  },

  getPlayerDiscoveredCells: (player: Player) =>
    uniqBy(
      getPlayerDiscoveredCells(player).flat(),
      cell => `${cell.x}.${cell.y}`
    ),

  addAction(action: GameStateAction) {
    gameState.actionsQueue.push(action);
  }
};
