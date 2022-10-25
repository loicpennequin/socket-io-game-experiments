import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import {
  GAME_STATE_UPDATE,
  PLAYER_ACTION_START
  // PLAYER_ACTION_END
} from '../../../events';
import { GAME_GRID_SIZE, PLAYER_ACTIONS } from '../../../constants';
import { clamp } from '../../../utils';

export type Player = {
  id: string;
  x: number;
  y: number;
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
  clamp(n, { min: 0, max: GAME_GRID_SIZE - 1 });

const makePlayer = (): Player => ({
  x: Math.round(Math.random() * GAME_GRID_SIZE),
  y: Math.round(Math.random() * GAME_GRID_SIZE),
  id: nanoid(6)
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

export const socketIoHandler = (io: Server) => {
  io.on('connection', socket => {
    const player = makePlayer();
    gameState.players[socket.id] = player;

    sendStateUpdate(io);

    socket.on('disconnect', () => {
      delete gameState.players[socket.id];
      sendStateUpdate(io);
    });

    const movePlayer = (diff: { x: number; y: number }) => {
      const player = gameState.players[socket.id];
      player.x = clampToGrid(player.x + diff.x);
      player.y = clampToGrid(player.y + diff.y);
      sendStateUpdate(io);
    };

    socket.on(PLAYER_ACTION_START, ({ action }) => {
      switch (action) {
        case PLAYER_ACTIONS.MOVE_UP:
          return movePlayer({ x: 0, y: -1 });
        case PLAYER_ACTIONS.MOVE_DOWN:
          return movePlayer({ x: 0, y: 1 });
        case PLAYER_ACTIONS.MOVE_LEFT:
          return movePlayer({ x: -1, y: 0 });
        case PLAYER_ACTIONS.MOVE_RIGHT:
          return movePlayer({ x: 1, y: 0 });
      }
    });
  });
};
