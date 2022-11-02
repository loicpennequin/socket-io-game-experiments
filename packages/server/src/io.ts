import http from 'http';
import { Server, Socket as IoSocket } from 'socket.io';
import { Coordinates } from '@game/shared-utils';
import { isPlayer } from './utils';
import { createPlayer } from './factories/playerFactory';
import { createGameWorld } from './factories/gameWorldFactory';
import { createGameMap } from './factories/gameMapFactory';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_STATE_UPDATE,
  PING,
  PLAYER_ONGOING_ACTION_START,
  PlayerAction,
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ACTION
} from '@game/domain';

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

  const world = createGameWorld({
    map: createGameMap()
  });

  world.onStateUpdate(gameState => {
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

  world.start();

  io.on('connection', socket => {
    const player = world.addEntity(
      createPlayer({
        id: socket.id,
        world: world
      })
    );

    socket.on('disconnect', () => {
      player.destroy();
    });

    socket.on(PING, (timestamp, callback) => {
      callback(timestamp);
    });

    socket.on(PLAYER_ONGOING_ACTION_START, ({ action }) => {
      const actionKey = `${player.id}.${action}`;
      switch (action) {
        case PlayerAction.MOVE_UP:
          return world.addOngoingAction(actionKey, () =>
            player.move({ x: 0, y: -1 })
          );

        case PlayerAction.MOVE_DOWN:
          return world.addOngoingAction(actionKey, () =>
            player.move({ x: 0, y: 1 })
          );
        case PlayerAction.MOVE_LEFT:
          return world.addOngoingAction(actionKey, () =>
            player.move({ x: -1, y: 0 })
          );
        case PlayerAction.MOVE_RIGHT:
          return world.addOngoingAction(actionKey, () =>
            player.move({ x: 1, y: 0 })
          );
      }
    });

    socket.on(PLAYER_ONGOING_ACTION_END, ({ action }) => {
      world.stopOngoingAction(`${player.id}.${action}`);
    });

    socket.on(PLAYER_ACTION, ({ action, meta }) => {
      switch (action) {
        case PlayerAction.FIRE_PROJECTILE:
          world.addAction(() =>
            world.addEntity(player.fireProjectile(meta.target))
          );
      }
    });
  });
};
