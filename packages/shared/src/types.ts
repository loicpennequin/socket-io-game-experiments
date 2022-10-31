import { PlayerAction } from './constants';
import * as events from './events';

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

export type GameMapCell = Coordinates & {
  lightness: number;
};

export type PlayerDto = Coordinates & {
  id: string;
};

export type GameStateDto = {
  players: PlayerDto[];
  playerCount: number;
  discoveredCells: GameMapCell[];
};

export type GameAction = { action: PlayerAction };

export type ServerToClientEvents = {
  [events.GAME_STATE_UPDATE]: (state: GameStateDto) => void;
};

export type ClientToServerEvents = {
  [events.PLAYER_ONGOING_ACTION_START]: ({ action }: GameAction) => void;
  [events.PLAYER_ONGOING_ACTION_END]: ({ action }: GameAction) => void;
  [events.PLAYER_ACTION]: ({ action }: GameAction) => void;
};
