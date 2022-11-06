import type {
  AnyObject,
  Coordinates,
  Nullable,
  Override
} from '@game/shared-utils';
import type { GameMapCell } from '.';
import type { EntityOrientation, EntityType, PlayerJob } from '../enums';

export type EntityDto = Coordinates & {
  id: string;
  type: EntityType;
  parent: Nullable<string>;
  children: string[];
  meta: AnyObject;
};

export type PlayerDto = Override<
  EntityDto,
  { meta: { name: string; orientation: EntityOrientation; job: PlayerJob } }
>;

export type ProjectileDto = EntityDto;

export type GameStateDto = {
  entities: EntityDto[];
  playerCount: number;
  discoveredCells: GameMapCell[];
};
