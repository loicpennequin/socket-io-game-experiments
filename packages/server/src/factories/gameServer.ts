import http from 'http';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_STATE_UPDATE,
  PING,
  PLAYER_ONGOING_ACTION_START,
  PlayerAction,
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ACTION,
  EntityOrientation,
  JOIN_GAME,
  BOTS_COUNT,
  PlayerJob,
  FireProjectileActionPayload,
  MoveActionPayload
} from '@game/shared-domain';
import { GameWorld } from './gameWorld';
import { isPlayer } from '../utils';
import { createPlayer, Player } from './player';
import { PORT } from '../constants';
import { v4 as uuid } from 'uuid';
import randomNames from 'random-name';
import { randomInt } from '@game/shared-utils';

export const createGameServer = (server: http.Server, world: GameWorld) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  world.onStateUpdate(gameState => {
    const players = [...gameState.entities.values()].filter(isPlayer);
    players.forEach(player => {
      const socket = io.sockets.sockets.get(player.id);

      if (!socket) {
        // player.destroy();
        return;
      }

      socket.emit(GAME_STATE_UPDATE, {
        playerCount: players.length,
        entities: player.visibleEntities.map(entity => entity.toDto()),
        discoveredCells: player.consumeDiscoveredCells()
      });
    });
  });

  for (let i = 0; i <= BOTS_COUNT; i++) {
    world.addEntity(
      createPlayer({
        id: uuid(),
        world: world,
        meta: {
          name: randomNames.first(),
          orientation: EntityOrientation.RIGHT,
          job: 'ROGUE'
        }
      })
    );
  }
  io.on('connection', socket => {
    let player: Player;

    socket.on('disconnect', () => {
      player?.destroy();
    });

    socket.on(PING, (timestamp, callback) => {
      callback(timestamp);
    });

    socket.on(JOIN_GAME, (payload, callback) => {
      player = world.addEntity(
        createPlayer({
          id: socket.id,
          world: world,
          meta: {
            name: payload.username,
            orientation: EntityOrientation.RIGHT,
            job: payload.job
          }
        })
      );

      callback();
    });

    socket.on(PLAYER_ACTION, action => {
      if (!player) return;

      switch (action.type) {
        case PlayerAction.MOVE:
          return world.addAction(() => player.move(action.meta.directions));
        case PlayerAction.FIRE_PROJECTILE:
          return world.addAction(() =>
            player.fireProjectile(action.meta.target)
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
