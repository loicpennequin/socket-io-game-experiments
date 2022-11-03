import http from 'http';
import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_STATE_UPDATE,
  PING,
  PLAYER_ONGOING_ACTION_START,
  PlayerAction,
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ACTION
} from '@game/shared-domain';
import { GameWorld } from './gameWorld';
import { isPlayer } from '../utils';
import { createPlayer } from './player';
import { PORT } from '../constants';

export const createGameServer = (server: http.Server, world: GameWorld) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  world.onStateUpdate(gameState => {
    [...gameState.entities.values()].filter(isPlayer).forEach(player => {
      const socket = io.sockets.sockets.get(player.id);

      if (!socket) {
        player.destroy();
        return;
      }

      socket.emit(GAME_STATE_UPDATE, {
        playerCount: gameState.entities.size,
        entities: player.visibleEntities.map(entity => entity.toDto()),
        discoveredCells: player.consumeDiscoveredCells()
      });
    });
  });

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

      return world.addOngoingAction(actionKey, () => {
        switch (action) {
          case PlayerAction.MOVE_UP:
            return player.move({ x: 0, y: -1 });
          case PlayerAction.MOVE_DOWN:
            return player.move({ x: 0, y: 1 });
          case PlayerAction.MOVE_LEFT:
            return player.move({ x: -1, y: 0 });
          case PlayerAction.MOVE_RIGHT:
            return player.move({ x: 1, y: 0 });
        }
      });
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

  return {
    start(cb: (port: string | number) => void) {
      world.start();
      server.listen(PORT, () => {
        cb(PORT);
      });
    }
  };
};
