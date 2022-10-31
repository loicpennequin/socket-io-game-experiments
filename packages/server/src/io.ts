import http from 'http';
import { Server } from 'socket.io';
import {
  GAME_STATE_UPDATE,
  PLAYER_ACTION_START,
  PLAYER_ACTION_END,
  PlayerAction,
  Coordinates,
  GameMapCell
} from '@game/shared';
import { gameController } from './gameController';

export type PlayerDto = Coordinates & {
  id: string;
};

export type GameStateDto = {
  players: PlayerDto[];
  playerCount: number;
  discoveredCells: GameMapCell[];
};

type PlayerActionStartPayload = {
  action: PlayerAction;
};

type PlayerActionEndPayload = {
  action: PlayerAction;
};

export const socketIoHandler = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const getSocketByPlayerId = (id: string) => io.sockets.sockets.get(id);

  gameController.onStateUpdate(gameState => {
    Object.values(gameState.players).forEach((player, _, arr) => {
      const socket = getSocketByPlayerId(player.id);

      const dto: GameStateDto = {
        playerCount: arr.length,
        players: gameController.getPlayerFieldOFView(player),
        discoveredCells: Array.from(player.newDiscoveredCells.values())
      };
      socket!.emit(GAME_STATE_UPDATE, dto);
    });
  });

  gameController.start();

  io.on('connection', socket => {
    const player = gameController.addPlayer(socket.id);

    socket.on('disconnect', () => {
      gameController.removePlayer(player);
    });

    socket.on(PLAYER_ACTION_START, ({ action }: PlayerActionStartPayload) => {
      player.ongoingActions.add(action);
    });

    socket.on(PLAYER_ACTION_END, ({ action }: PlayerActionEndPayload) => {
      player.ongoingActions.delete(action);
    });
  });
};
