import type {
  AnyObject,
  Coordinates,
  Nullable,
  Override
} from '@game/shared-utils';
import type {
  EntityOrientation,
  EntityType,
  OngoingAction,
  PlayerAction
} from './enums';

import {
  GAME_STATE_UPDATE,
  PING,
  PLAYER_ACTION,
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ONGOING_ACTION_START
} from './events';

export type EntityDto = Coordinates & {
  id: string;
  type: EntityType;
  parent: Nullable<string>;
  children: string[];
  meta: AnyObject;
};

export type PlayerMeta = { name: string; orientation: EntityOrientation };
export type PlayerDto = Override<EntityDto, { meta: PlayerMeta }>;

export type ProjectileDto = EntityDto;
export type GameMapCell = Coordinates & {
  lightness: number;
};

export type GameStateDto = {
  entities: EntityDto[];
  playerCount: number;
  discoveredCells: GameMapCell[];
};

export type MoveAction = Extract<
  PlayerAction,
  'MOVE_UP' | 'MOVE_DOWN' | 'MOVE_RIGHT' | 'MOVE_LEFT'
>;
export type MoveActionPayload = {
  action: MoveAction;
  meta?: undefined;
};

export type FireProjectileAction = Extract<PlayerAction, 'FIRE_PROJECTILE'>;
export type FireProjectileActionPayload = {
  action: Extract<PlayerAction, 'FIRE_PROJECTILE'>;
  meta: { target: Coordinates };
};

export type ActionPayload = FireProjectileActionPayload;
export type OngoingActionStartPayload = MoveActionPayload;
export type OngoingActionEndPayload = { action: OngoingAction };

export type ServerToClientEvents = {
  [GAME_STATE_UPDATE]: (state: GameStateDto) => void;
};
export type ClientToServerEvents = {
  [PING]: (timestamp: number, callback: (e: number) => void) => void;
  [PLAYER_ONGOING_ACTION_START]: (payload: OngoingActionStartPayload) => void;
  [PLAYER_ONGOING_ACTION_END]: (payload: OngoingActionEndPayload) => void;
  [PLAYER_ACTION]: (payload: ActionPayload) => void;
};
