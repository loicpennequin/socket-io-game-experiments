import { ONGOING_ACTIONS, PLAYER_ACTIONS } from './constants';
import {
  GAME_STATE_UPDATE,
  PLAYER_ACTION,
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ONGOING_ACTION_START
} from './events';

export type Nullable<T> = T | null | undefined;
export type PartialBy<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Coordinates = { x: number; y: number };
export type Dimensions = { w: number; h: number };
export type SpatialObject = { dimensions: Dimensions; position: Coordinates };
export type Boundaries<T = number> = { min: T; max: T };
export type Range = Boundaries<number>;
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export type Matrix<T> = T[][];
export type AnyObject = Record<string, any>;
export type Values<T> = T[keyof T];
export type GameMapCell = Coordinates & {
  lightness: number;
};

export type EntityDto = Coordinates & {
  id: string;
  type: EntityType;
};
export type PlayerDto = EntityDto;
export type ProjectileDto = EntityDto & {
  playerId: string;
};
export type GameStateDto = {
  entities: EntityDto[];
  playerCount: number;
  discoveredCells: GameMapCell[];
};

export type EntityType = 'player' | 'projectile';

export type PlayerAction = Values<typeof PLAYER_ACTIONS>;
export type OngoingAction = typeof ONGOING_ACTIONS[number];

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
  meta: { mousePosition: Coordinates };
};

export type ActionPayload = FireProjectileActionPayload;
export type OngoingActionStartPayload = MoveActionPayload;
export type OngoingActionEndPayload = { action: OngoingAction };

export type ServerToClientEvents = {
  [GAME_STATE_UPDATE]: (state: GameStateDto) => void;
};
export type ClientToServerEvents = {
  [PLAYER_ONGOING_ACTION_START]: (payload: OngoingActionStartPayload) => void;
  [PLAYER_ONGOING_ACTION_END]: (payload: OngoingActionEndPayload) => void;
  [PLAYER_ACTION]: (payload: ActionPayload) => void;
};
