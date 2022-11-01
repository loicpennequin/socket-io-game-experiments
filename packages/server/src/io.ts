import http from 'http';
import { Server } from 'socket.io';
import {
  GAME_STATE_UPDATE,
  PLAYER_ONGOING_ACTION_START,
  PLAYER_ONGOING_ACTION_END,
  Coordinates,
  ClientToServerEvents,
  ServerToClientEvents,
  PLAYER_ACTION
} from '@game/shared';
import { gameController, isPlayer } from './gameController';

export type EntityDto = Coordinates & {
  id: string;
};

export const socketIoHandler = (server: http.Server) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const getSocketByPlayerId = (id: string) => io.sockets.sockets.get(id);

  gameController.onStateUpdate(gameState => {
    Object.values(gameState.entities)
      .filter(isPlayer)
      .forEach((player, _, arr) => {
        const socket = getSocketByPlayerId(player.id);

        if (!socket) {
          console.warn(
            `Player ${player.id} seems to not be tied to an active socket, something must be wrong...`
          );
          return;
        }

        socket.emit(GAME_STATE_UPDATE, {
          playerCount: arr.length,
          entities: gameController.getPlayerFieldOFView(player),
          discoveredCells: gameController.getPlayerDiscoveredCells(player)
        });
      });
  });

  gameController.start();

  io.on('connection', socket => {
    const player = gameController.addPlayer(socket.id);

    socket.on('disconnect', () => {
      gameController.removePlayer(player);
    });

    socket.on(PLAYER_ONGOING_ACTION_START, ({ action }) => {
      player.ongoingActions.add(action);
    });

    socket.on(PLAYER_ONGOING_ACTION_END, ({ action }) => {
      player.ongoingActions.delete(action);
    });

    socket.on(PLAYER_ACTION, ({ action, meta }) => {
      gameController.addAction({
        action,
        meta,
        player
      });
    });
  });
};
