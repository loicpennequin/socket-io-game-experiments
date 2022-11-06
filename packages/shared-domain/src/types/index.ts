import type { Coordinates } from '@game/shared-utils';
import type { TerrainType } from '../enums';

export type GameMapCell = Coordinates & {
  type: TerrainType;
};

export type Directions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export * from './dtos';
export * from './payloads';
