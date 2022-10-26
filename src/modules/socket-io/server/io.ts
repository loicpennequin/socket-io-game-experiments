import { Server } from 'socket.io';
import {
  GAME_STATE_UPDATE,
  PLAYER_ACTION_START,
  PLAYER_ACTION_END
} from '../../../events';
import {
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_ACTIONS,
  PlayerAction,
  TICK_RATE,
  PLAYER_SPEED,
  PLAYER_SIZE,
  PLAYER_FIELD_OF_VIEW
} from '../../../constants';
import { clamp } from '../../../utils/math';
import {
  makeSpatialHashGrid,
  SpatialHashGrid,
  SpatialHashGridItem
} from '../../../utils/spatialHashGrid';

export type PlayerMeta = {
  id: string;
};

export type Player = {
  id: string;
  gridItem: SpatialHashGridItem<PlayerMeta>;
  ongoingActions: Set<PlayerAction>;
};

export type PlayerDto = {
  id: string;
  x: number;
  y: number;
};

export type GameState = {
  players: Record<string, Player>;
  grid: SpatialHashGrid<PlayerMeta>;
};

export type GameStateDto = {
  players: PlayerDto[];
  playerCount: number;
};

const gameState: GameState = {
  players: {},
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

const makePlayer = (socketId: string): Player => {
  const meta = { id: socketId };

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

const getSocketByPlayerId = (io: Server, id: string) =>
  io.sockets.sockets.get(id);

const sendStateUpdate = (io: Server) => {
  Object.values(gameState.players).forEach((player, _, arr) => {
    const socket = getSocketByPlayerId(io, player.id);

    const dto: GameStateDto = {
      playerCount: arr.length,
      players: gameState.grid
        .findNearbyRadius(player.gridItem.position, PLAYER_FIELD_OF_VIEW)
        .map(gridItem => ({
          ...gridItem.position,
          id: gridItem.meta.id
        }))
    };
    socket.emit(GAME_STATE_UPDATE, dto);
  });
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

const removePlayer = (player: Player) => {
  gameState.grid.remove(player.gridItem);
  delete gameState.players[player.id];
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
        case PLAYER_ACTIONS.QUIT:
          removePlayer(player);
      }
    });
  });
};

setInterval(() => {
  updateGameState();
}, 1000 / TICK_RATE);

export const socketIoHandler = (io: Server) => {
  setInterval(() => {
    updateGameState();
    sendStateUpdate(io);
  }, 1000 / TICK_RATE);

  io.on('connection', socket => {
    const player = makePlayer(socket.id);
    gameState.players[socket.id] = player;

    socket.on('disconnect', () => {
      gameState.players[socket.id].ongoingActions.clear();
      gameState.players[socket.id].ongoingActions.add(PLAYER_ACTIONS.QUIT);
    });

    socket.on(PLAYER_ACTION_START, ({ action }) => {
      gameState.players[socket.id].ongoingActions.add(action);
    });

    socket.on(PLAYER_ACTION_END, ({ action }) => {
      gameState.players[socket.id].ongoingActions.delete(action);
    });
  });
};
