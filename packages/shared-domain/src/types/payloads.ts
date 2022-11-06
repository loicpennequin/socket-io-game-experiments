import type { Coordinates } from '@game/shared-utils';
import type { Directions } from '.';
import type { PlayerAction, PlayerJob } from '../enums';

import { GAME_STATE_UPDATE, JOIN_GAME, PING, PLAYER_ACTION } from '../events';
import type { GameStateDto } from './dtos';

export type FireProjectileAction = Extract<PlayerAction, 'FIRE_PROJECTILE'>;
export type FireProjectileActionPayload = {
  type: FireProjectileAction;
  meta: { target: Coordinates };
};

export type MoveAction = Extract<PlayerAction, 'MOVE'>;
export type MoveActionPayload = {
  type: MoveAction;
  meta: { directions: Directions };
};

export type ActionPayload = FireProjectileActionPayload | MoveActionPayload;
export type JoinGamePayload = { username: string; job: PlayerJob };

export type ServerToClientEvents = {
  [GAME_STATE_UPDATE]: (state: GameStateDto) => void;
};
export type ClientToServerEvents = {
  [PING]: (timestamp: number, callback: (e: number) => void) => void;
  [JOIN_GAME]: (payload: JoinGamePayload, callback: () => void) => void;
  [PLAYER_ACTION]: (payload: ActionPayload) => void;
};

type Foo =
  | {
      a: 'foo';
      b: boolean;
    }
  | { a: 'bar'; b: number };
