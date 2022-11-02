import http from 'http';
import { Server, Socket as IoSocket } from 'socket.io';
import {
  GAME_STATE_UPDATE,
  PLAYER_ONGOING_ACTION_START,
  PLAYER_ONGOING_ACTION_END,
  Coordinates,
  ClientToServerEvents,
  ServerToClientEvents,
  PLAYER_ACTION,
  PING
} from '@game/shared';
import { gameController } from './controllers/gameController';
import { isPlayer } from './utils';

export type EntityDto = Coordinates & {
  id: string;
};

type Socket = IoSocket<ClientToServerEvents, ServerToClientEvents>;

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
        const socket = getSocketByPlayerId(player.id) as Socket;

        const entities = gameController
          .getPlayerFieldOFView(player)
          .map(entity => entity.toDto());

        socket.emit(GAME_STATE_UPDATE, {
          playerCount: arr.length,
          entities,
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

    socket.on(PING, (timestamp, callback) => {
      callback(timestamp);
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
