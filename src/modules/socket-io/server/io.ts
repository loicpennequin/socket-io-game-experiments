import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
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
  PLAYER_SPEED
} from '../../../constants';
import { clamp } from '../../../utils';

export type Player = {
  id: string;
  x: number;
  y: number;
  ongoingActions: Set<PlayerAction>;
};

export type PlayerDto = {
  id: string;
  x: number;
  y: number;
};

export type GameState = {
  players: Record<string, Player>;
};

export type GameStateDto = {
  players: PlayerDto[];
};

const clampToGrid = (n: number) =>
  clamp(n, { min: 0, max: GRID_SIZE * CELL_SIZE });

const makePlayer = (): Player => ({
  id: nanoid(6),
  x: Math.round(Math.random() * GRID_SIZE * CELL_SIZE),
  y: Math.round(Math.random() * GRID_SIZE * CELL_SIZE),
  ongoingActions: new Set()
});

const gameState: GameState = {
  players: {}
};

const sendStateUpdate = (io: Server) => {
  const dto: GameStateDto = {
    ...gameState,
    players: Object.values(gameState.players)
  };

  io.emit(GAME_STATE_UPDATE, dto);
};

const movePlayer = (player: Player, { x = 0, y = 0 }) => {
  player.x = clampToGrid(player.x + x * PLAYER_SPEED);
  player.y = clampToGrid(player.y + y * PLAYER_SPEED);
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

setInterval(() => {
  updateGameState();
}, 1000 / TICK_RATE);

export const socketIoHandler = (io: Server) => {
  setInterval(() => {
    updateGameState();
    sendStateUpdate(io);
  }, 1000 / TICK_RATE);

  io.on('connection', socket => {
    const player = makePlayer();
    gameState.players[socket.id] = player;

    socket.on('disconnect', () => {
      delete gameState.players[socket.id];
    });

    socket.on(PLAYER_ACTION_START, ({ action }) => {
      gameState.players[socket.id].ongoingActions.add(action);
    });

    socket.on(PLAYER_ACTION_END, ({ action }) => {
      gameState.players[socket.id].ongoingActions.delete(action);
    });
  });
};
