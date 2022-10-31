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
  ENTITY_TYPES
} from '@game/shared';
import { v4 as uuid } from 'uuid';

export type EntityMeta = {
  id: string;
  type: EntityType;
};

export type Entity = { id: string; type: EntityType };

export type Player = Entity & {
  gridItem: SpatialHashGridItem<EntityMeta>;
  allDiscoveredCells: Map<string, GameMapCell>;
  newDiscoveredCells: Map<string, GameMapCell>;
  ongoingActions: Set<OngoingAction>;
};

export type Projectile = Entity & {
  player: Player;
  gridItem: SpatialHashGridItem<EntityMeta>;
  lifeSpan: number;
  direction: Coordinates;
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

const getVisibleCells = (point: Coordinates) => {
  const coords = {
    min: {
      x: point.x - PLAYER_FIELD_OF_VIEW,
      y: point.y - PLAYER_FIELD_OF_VIEW
    },
    max: {
      x: point.x + PLAYER_FIELD_OF_VIEW, // why + CELL_SIZE tho
      y: point.y + PLAYER_FIELD_OF_VIEW
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

      if (dist(point, pointToCompare) <= PLAYER_FIELD_OF_VIEW) {
        const cell = gameState.map.grid[x]?.[y];
        if (cell) {
          entries.push([`${x}.${y}`, cell]);
        }
      }
    }
  }

  return new Map(entries);
};

const makeProjectile = (
  player: Player,
  mousePosition: Coordinates
): Projectile => {
  const position = { ...player.gridItem.position };

  const dimensions = { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE };
  const meta = {
    id: uuid(),
    type: ENTITY_TYPES.PROJECTILE
  };

  return {
    ...meta,
    player,
    direction: mousePosition,
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

  const visibleCells = getVisibleCells(player.gridItem.position);
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
    allDiscoveredCells: getVisibleCells(position),
    newDiscoveredCells: getVisibleCells(position),
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
  const projectile = makeProjectile(player, meta.mousePosition);
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

const processOngoingActions = () => {
  Object.values(gameState.entities)
    .filter(isPlayer)
    .forEach(entity => {
      if (!isPlayer(entity)) return;

      entity.ongoingActions.forEach(action => {
        switch (action) {
          case PLAYER_ACTIONS.MOVE_UP:
            return movePlayer(entity, { y: -1 });
          case PLAYER_ACTIONS.MOVE_DOWN:
            return movePlayer(entity, { y: 1 });
          case PLAYER_ACTIONS.MOVE_LEFT:
            return movePlayer(entity, { x: -1 });
          case PLAYER_ACTIONS.MOVE_RIGHT:
            return movePlayer(entity, { x: 1 });
        }
      });
    });
};

const updateGameState = () => {
  processOngoingActions();
  processActionQueue();
};

const cleanupState = () => {
  Object.values(gameState.entities)
    .filter(isPlayer)
    .forEach(player => {
      player.newDiscoveredCells.clear();
    });
};

const updateCallbacks = new Set<StateUpdateCallback>();

export const gameController = {
  get gameState() {
    return gameState as Readonly<GameState>;
  },

  start: () => {
    if (isRunning) return;

    setInterval(() => {
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
    return gameState.grid
      .findNearbyRadius(player.gridItem.position, PLAYER_FIELD_OF_VIEW)
      .map(gridItem => ({
        ...gridItem.position,
        ...gridItem.meta
      }));
  },

  addAction(action: GameStateAction) {
    gameState.actionsQueue.push(action);
  }
};
