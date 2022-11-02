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
  PING,
  PlayerAction
} from '@game/shared';
import { isPlayer } from './utils';
import { createPlayer } from './factories/playerFactory';
import { createGameWorld } from './factories/gameWorldFactory';
import { createGameMap } from './factories/gameMapFactory';

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

  const gameWorld = createGameWorld({
    map: createGameMap()
  });

  gameWorld.onStateUpdate(gameState => {
    [...gameState.entities.values()]
      .filter(isPlayer)
      .forEach((player, _, arr) => {
        const socket = getSocketByPlayerId(player.id) as Socket;

        socket.emit(GAME_STATE_UPDATE, {
          playerCount: arr.length,
          entities: player.visibleEntities.map(entity => entity.toDto()),
          discoveredCells: player.consumeDiscoveredCells()
        });
      });
  });

  gameWorld.start();

  io.on('connection', socket => {
    const player = gameWorld.addEntity(
      createPlayer({
        id: socket.id,
        world: gameWorld
      })
    );

    socket.on('disconnect', () => {
      player.destroy();
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
      switch (action) {
        case PlayerAction.FIRE_PROJECTILE:
          gameWorld.addAction(() =>
            gameWorld.addEntity(player.fireProjectile(meta.target))
          );
      }
    });
  });
};
