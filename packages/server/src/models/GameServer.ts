import http from 'http';
import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_STATE_UPDATE,
  PING,
  PlayerAction,
  PLAYER_ACTION,
  EntityOrientation,
  JOIN_GAME,
  BOTS_COUNT,
  IDLE_DISCONNECT_TIMEOUT
} from '@game/shared-domain';
import { GameWorld } from '../models/GameWorld';
import { Player } from '../models/Player';
import { createPlayer } from '../factories/player';
import { PORT } from '../constants';
import { v4 as uuid } from 'uuid';
import randomNames from 'random-name';
import { Nullable } from '@game/shared-utils';

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(private server: http.Server, private world: GameWorld) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.SERVER_URL || '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupWorldListener();
    this.setupIoListener();
    this.addBots();
  }

  private setupWorldListener() {
    this.world.on('update', () => {
      this.io
        .fetchSockets()
        .then(sockets => {
          sockets.forEach(socket => {
            const player = this.world.getEntity<Player>(socket.id);
            if (!player) return;
            socket.emit(GAME_STATE_UPDATE, {
              entities: player.visibleEntities.map(entity => entity.toDto()),
              discoveredCells: player.visibleCells.map(c => c.toDto())
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  refreshIdleTimeout(socket: Socket) {
    return setTimeout(() => {
      socket.disconnect();
    }, IDLE_DISCONNECT_TIMEOUT);
  }

  private setupIoListener() {
    this.io.on('connection', socket => {
      let idleTimeout: Nullable<ReturnType<typeof setTimeout>> = null;

      socket.on('disconnect', () => {
        idleTimeout = null;
        this.world.getEntity(socket.id)?.destroy();
      });

      socket.on(PING, (timestamp, callback) => {
        callback(timestamp);
      });

      socket.on(JOIN_GAME, (payload, callback) => {
        if (idleTimeout) {
          clearTimeout(idleTimeout);
        }
        idleTimeout = this.refreshIdleTimeout(socket);

        this.world.addEntity(
          createPlayer({
            id: socket.id,
            world: this.world,
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
        if (idleTimeout) {
          clearTimeout(idleTimeout);
        }
        idleTimeout = this.refreshIdleTimeout(socket);

        const player = this.world.getEntity<Player>(socket.id);
        if (!player) return;

        switch (action.type) {
          case PlayerAction.MOVE:
            return this.world.scheduleAction(() =>
              player.handleKeyboardMovement(action.meta.directions)
            );
          case PlayerAction.MOVE_TO:
            return this.world.scheduleAction(() =>
              player.moveTo(action.meta.target)
            );
          case PlayerAction.FIRE_PROJECTILE:
            return this.world.scheduleAction(() =>
              player.shootProjectile(action.meta.target)
            );
        }
      });
    });
  }

  private addBots() {
    for (let i = 0; i < BOTS_COUNT; i++) {
      this.world.addEntity(
        createPlayer({
          id: uuid(),
          world: this.world,
          meta: {
            name: randomNames.first(),
            orientation: EntityOrientation.RIGHT,
            job: 'ROGUE'
          }
        })
      );
    }
  }

  start(cb: (port: string | number) => void) {
    this.world.start();
    this.server.listen(PORT, () => {
      cb(PORT);
    });
  }
}
