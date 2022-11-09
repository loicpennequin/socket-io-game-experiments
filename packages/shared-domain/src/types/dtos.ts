import type {
  AnyObject,
  Coordinates,
  Nullable,
  Override
} from '@game/shared-utils';
import type { GameMapCellDto } from '.';
import type { EntityOrientation, EntityType, PlayerJob } from '../enums';

export type CreatureStats = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
};

export type EntityDto = Coordinates & {
  id: string;
  type: EntityType;
  parent: Nullable<string>;
  children: string[];
  meta: AnyObject;
};

export type PlayerMeta = {
  name: string;
  orientation: EntityOrientation;
  job: PlayerJob;
};
export type PlayerDto = Override<
  EntityDto,
  { meta: PlayerMeta; stats: CreatureStats }
>;

export type ProjectileDto = EntityDto;

export type GameStateDto = {
  entities: EntityDto[];
  discoveredCells: GameMapCellDto[];
};
