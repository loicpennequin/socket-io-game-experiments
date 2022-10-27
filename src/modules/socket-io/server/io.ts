import { Server } from 'socket.io';
import {
  GAME_STATE_UPDATE,
  PLAYER_ACTION_START,
  PLAYER_ACTION_END
} from '../../../events';
import { PlayerAction } from '../../../constants';
import { gameController } from '../../../server/controllers/gameController';

export type PlayerDto = {
  id: string;
  x: number;
  y: number;
};

export type GameStateDto = {
  players: PlayerDto[];
  playerCount: number;
};

type PlayerActionStartPayload = {
  action: PlayerAction;
};

type PlayerActionEndPayload = {
  action: PlayerAction;
};

export const socketIoHandler = (io: Server) => {
  const getSocketByPlayerId = (id: string) => io.sockets.sockets.get(id);

  gameController.onStateUpdate(gameState => {
    Object.values(gameState.players).forEach((player, _, arr) => {
      const socket = getSocketByPlayerId(player.id);

      const dto: GameStateDto = {
        playerCount: arr.length,
        players: gameController.getPlayerFieldOFView(player)
      };
      socket.emit(GAME_STATE_UPDATE, dto);
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
