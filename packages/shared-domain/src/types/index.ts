import type { AnyObject, Coordinates } from '@game/shared-utils';
import type { TerrainType } from '../enums';

export type TriggeredBehaviors = { key: string; meta: AnyObject }[];

export type GameMapCellDto = Coordinates & {
  type: TerrainType;
};

export type Directions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type FieldOfView = {
  hard: number;
  soft: number;
};

export * from './dtos';
export * from './payloads';
