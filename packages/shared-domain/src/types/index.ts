import type { Coordinates } from '@game/shared-utils';

export type GameMapCell = Coordinates & {
  lightness: number;
};

export type Directions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export * from './dtos';
export * from './payloads';
