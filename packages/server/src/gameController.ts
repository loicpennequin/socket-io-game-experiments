import {
  Coordinates,
  createMatrix,
  Matrix,
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_ACTIONS,
  PLAYER_SPEED,
  PLAYER_SIZE,
  TICK_RATE,
  PLAYER_FIELD_OF_VIEW,
  clamp,
  dist,
  mapRange,
  perlinMatrix,
  makeSpatialHashGrid,
  SpatialHashGrid,
  SpatialHashGridItem,
  GameMapCell,
  OngoingAction,
  ActionPayload,
  FireProjectileActionPayload,
  EntityType,
  PROJECTILE_SIZE,
  PROJECTILE_LIFESPAN,
  ENTITY_TYPES,
  PROJECTILE_SPEED,
  getAnghleFromVector,
  PROJECTILE_FIELD_OF_VIEW,
  uniqBy
} from '@game/shared';
import { v4 as uuid } from 'uuid';
import { performance } from 'perf_hooks';

export type EntityMeta = {
  id: string;
  type: EntityType;
};

export type Entity = {
  id: string;
  type: EntityType;
  gridItem: SpatialHashGridItem<EntityMeta>;
};

export type Player = Entity & {
  ongoingActions: Set<OngoingAction>;
  newDiscoveredCells: Map<string, GameMapCell>;
  allDiscoveredCells: Map<string, GameMapCell>;
};

export type Projectile = Entity & {
  player: Player;
  lifeSpan: number;
  angle: number;
};

export type GameMap = {
  grid: Matrix<GameMapCell>;
};

export type GameStateAction = ActionPayload & { player: Player };

export type GameState = {
  map: GameMap;
  entities: Record<string, Player | Projectile>;
  grid: SpatialHashGrid<EntityMeta>;
  actionsQueue: GameStateAction[];
};

export type StateUpdateCallback = (state: Readonly<GameState>) => void;

const mapDimensions = { w: GRID_SIZE, h: GRID_SIZE };
const noiseSeed = perlinMatrix(mapDimensions);

export const isPlayer = (entity: Entity): entity is Player =>
  entity.type === ENTITY_TYPES.PLAYER;
export const isProjectile = (entity: Entity): entity is Projectile =>
  entity.type === ENTITY_TYPES.PROJECTILE;

let isRunning = false;

const gameState: GameState = {
  entities: {},
  map: {
    grid: createMatrix(mapDimensions, ({ x, y }) => {
      const noise = Math.round(noiseSeed[x][y] * 100) / 100;
      return {
        x,
        y,
        lightness: mapRange(noise, { min: 0, max: 1 }, { min: 0.3, max: 0.75 })
      };
    })
  },
  grid: makeSpatialHashGrid<EntityMeta>({
    dimensions: { w: GRID_SIZE, h: GRID_SIZE },
    bounds: {
      start: { x: 0, y: 0 },
      end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
    }
  }),
  actionsQueue: []
};

const clampToGrid = (n: number) =>
  clamp(n, { min: 0, max: GRID_SIZE * CELL_SIZE });

const getVisibleCells = (point: Coordinates, fieldOfView: number) => {
  const coords = {
    min: {
      x: point.x - PLAYER_FIELD_OF_VIEW,
      y: point.y - PLAYER_FIELD_OF_VIEW
    },
    max: {
      x: point.x + fieldOfView,
      y: point.y + fieldOfView
    }
  };

  const indices = {
    point: gameState.grid.getCellIndex(point),
    min: gameState.grid.getCellIndex(coords.min),
    max: gameState.grid.getCellIndex(coords.max)
  };

  const entries: [string, GameMapCell][] = [];
  for (let x = indices.min.x; x <= indices.max.x; x++) {
    for (let y = indices.min.y; y <= indices.max.y; y++) {
      const pointToCompare = {
        x: x * CELL_SIZE + (x < indices.point.x ? CELL_SIZE : 0),
        y: y * CELL_SIZE + (y < indices.point.y ? CELL_SIZE : 0)
      };

      if (dist(point, pointToCompare) <= fieldOfView) {
        const cell = gameState.map.grid[x]?.[y];
        if (cell) {
          entries.push([`${x}.${y}`, cell]);
        }
      }
    }
  }

  return new Map(entries);
};

const makeProjectile = (player: Player, target: Coordinates): Projectile => {
  const position = { ...player.gridItem.position };

  const dimensions = { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE };
  const meta = {
    id: uuid(),
    type: ENTITY_TYPES.PROJECTILE
  };

  return {
    ...meta,
    player,
    angle: getAnghleFromVector({
      x: target.x - player.gridItem.position.x,
      y: target.y - player.gridItem.position.y
    }),
    lifeSpan: PROJECTILE_LIFESPAN,
    gridItem: gameState.grid.add(
      {
        position,
        dimensions
      },
      meta
    )
  };
};

const movePlayer = (player: Player, { x = 0, y = 0 }) => {
  if (x === 0 && y === 0) return;

  player.gridItem.position.x = clampToGrid(
    player.gridItem.position.x + x * PLAYER_SPEED
  );
  player.gridItem.position.y = clampToGrid(
    player.gridItem.position.y + y * PLAYER_SPEED
  );

  const visibleCells = getVisibleCells(
    player.gridItem.position,
    PLAYER_FIELD_OF_VIEW
  );
  for (const [key, cell] of visibleCells) {
    if (!player.allDiscoveredCells.has(key)) {
      player.allDiscoveredCells.set(key, cell);
      player.newDiscoveredCells.set(key, cell);
    }
  }

  gameState.grid.update(player.gridItem);
};

const makePlayer = (id: string): Player => {
  const position = {
    x: Math.round(Math.random() * GRID_SIZE * CELL_SIZE),
    y: Math.round(Math.random() * GRID_SIZE * CELL_SIZE)
  };

  const dimensions = { w: PLAYER_SIZE, h: PLAYER_SIZE };
  const meta = { id, type: ENTITY_TYPES.PLAYER };

  return {
    ...meta,
    allDiscoveredCells: getVisibleCells(position, PLAYER_FIELD_OF_VIEW),
    newDiscoveredCells: getVisibleCells(position, PLAYER_FIELD_OF_VIEW),
    gridItem: gameState.grid.add(
      {
        position,
        dimensions
      },
      meta
    ),
    ongoingActions: new Set()
  };
};

const fireProjectile = ({
  meta,
  player
}: FireProjectileActionPayload & { player: Player }) => {
  const projectile = makeProjectile(player, meta.target);
  gameState.entities[projectile.id] = projectile;
};

const processActionQueue = () => {
  let action = gameState.actionsQueue.shift();
  while (action) {
    switch (action.action) {
      case PLAYER_ACTIONS.FIRE_PROJECTILE:
        fireProjectile(action);
    }

    action = gameState.actionsQueue.shift();
  }
};

const updatePlayer = (player: Player) => {
  player.ongoingActions.forEach(action => {
    switch (action) {
      case PLAYER_ACTIONS.MOVE_UP:
        return movePlayer(player, { y: -1 });
      case PLAYER_ACTIONS.MOVE_DOWN:
        return movePlayer(player, { y: 1 });
      case PLAYER_ACTIONS.MOVE_LEFT:
        return movePlayer(player, { x: -1 });
      case PLAYER_ACTIONS.MOVE_RIGHT:
        return movePlayer(player, { x: 1 });
    }
  });
};

const updateProjectile = (projectile: Projectile) => {
  if (projectile.lifeSpan <= 0) {
    gameState.grid.remove(projectile.gridItem);
    delete gameState.entities[projectile.id];
    return;
  }

  projectile.gridItem.position.x +=
    Math.cos(projectile.angle) * PROJECTILE_SPEED;
  projectile.gridItem.position.y +=
    Math.sin(projectile.angle) * PROJECTILE_SPEED;

  const visibleCells = getVisibleCells(
    projectile.gridItem.position,
    PROJECTILE_FIELD_OF_VIEW
  );

  for (const [key, cell] of visibleCells) {
    if (!projectile.player.allDiscoveredCells.has(key)) {
      projectile.player.allDiscoveredCells.set(key, cell);
      projectile.player.newDiscoveredCells.set(key, cell);
    }
  }

  gameState.grid.update(projectile.gridItem);

  projectile.lifeSpan--;
};

const updateEntities = () => {
  Object.values(gameState.entities).forEach(entity => {
    switch (entity.type) {
      case ENTITY_TYPES.PLAYER:
        return updatePlayer(entity as Player);
      case ENTITY_TYPES.PROJECTILE:
        return updateProjectile(entity as Projectile);
    }
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
    gameState.grid.remove(projectile.gridItem);
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
  gameState.grid.findNearbyRadius(entity.gridItem.position, fov);

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
    const player = makePlayer(socketId);
    gameState.entities[socketId] = player;

    return player;
  },

  removePlayer: (player: Player) => {
    gameState.grid.remove(player.gridItem);
    delete gameState.entities[player.id];
  },

  getPlayerFieldOFView: (player: Player) => {
    const playerFov = getEntityFieldOfView(player, PLAYER_FIELD_OF_VIEW);
    const projectilesFov = getPlayerProjectiles(player).map(projectile =>
      getEntityFieldOfView(projectile, PROJECTILE_FIELD_OF_VIEW)
    );

    return uniqBy(
      [playerFov, projectilesFov].flat(2),
      gridItem => gridItem.meta.id
    ).map(gridItem => ({
      ...gridItem.position,
      ...gridItem.meta
    }));
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
