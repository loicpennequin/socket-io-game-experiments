import { Coordinates, createMatrix, Matrix } from '../../utils';
import {
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_ACTIONS,
  PlayerAction,
  PLAYER_SPEED,
  PLAYER_SIZE,
  TICK_RATE,
  PLAYER_FIELD_OF_VIEW
} from '../../constants';
import { clamp, nerdPerlin, perlinMatrix, randomInt } from '../../utils/math';
import {
  makeSpatialHashGrid,
  SpatialHashGrid,
  SpatialHashGridItem
} from '../../utils/spatialHashGrid';

export type PlayerMeta = {
  id: string;
};

export type Player = {
  id: string;
  gridItem: SpatialHashGridItem<PlayerMeta>;
  ongoingActions: Set<PlayerAction>;
};

export type GameMapCell = Coordinates & {
  lightness: number;
};

export type GameMap = {
  hue: number;
  grid: Matrix<GameMapCell>;
};

export type GameState = {
  map: GameMap;
  players: Record<string, Player>;
  grid: SpatialHashGrid<PlayerMeta>;
};

export type StateUpdateCallback = (state: Readonly<GameState>) => void;

const mapDimensions = { w: GRID_SIZE, h: GRID_SIZE };
const noiseSeed = perlinMatrix(mapDimensions);
nerdPerlin.seed();

const gameState: GameState = {
  players: {},
  map: {
    hue: randomInt(360),
    grid: createMatrix(mapDimensions, ({ x, y }) => {
      console.log({ x, y, good: noiseSeed[x][y], nerd: nerdPerlin.get(x, y) });
      return {
        x,
        y,
        lightness: Math.round(nerdPerlin.get(x, y) * 100) / 100
      };
    })
  },
  grid: makeSpatialHashGrid<PlayerMeta>({
    dimensions: { w: GRID_SIZE, h: GRID_SIZE },
    bounds: {
      start: { x: 0, y: 0 },
      end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
    }
  })
};

const clampToGrid = (n: number) =>
  clamp(n, { min: 0, max: GRID_SIZE * CELL_SIZE });

const makePlayer = (id: string): Player => {
  const meta = { id };

  return {
    ...meta,
    gridItem: gameState.grid.add(
      {
        position: {
          x: Math.round(Math.random() * GRID_SIZE * CELL_SIZE),
          y: Math.round(Math.random() * GRID_SIZE * CELL_SIZE)
        },
        dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE }
      },
      meta
    ),
    ongoingActions: new Set()
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
  gameState.grid.update(player.gridItem);
};

const updateGameState = () => {
  Object.values(gameState.players).forEach(player => {
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
  });
};

const updateCallbacks = new Set<StateUpdateCallback>();
let isRunning = false;

export const gameController = {
  get gameState() {
    return gameState as Readonly<GameState>;
  },

  getPlayerById: (id: string) => gameState.players[id],

  addPlayer: (socketId: string) => {
    const player = makePlayer(socketId);
    gameState.players[socketId] = player;

    return player;
  },

  removePlayer: (player: Player) => {
    gameState.grid.remove(player.gridItem);
    delete gameState.players[player.id];
  },

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

  getPlayerFieldOFView: (player: Player) => {
    return gameState.grid
      .findNearbyRadius(player.gridItem.position, PLAYER_FIELD_OF_VIEW)
      .map(gridItem => ({
        ...gridItem.position,
        id: gridItem.meta.id
      }));
  }
};
