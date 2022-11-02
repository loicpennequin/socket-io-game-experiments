import { EntityType } from './enums';
import { EntityDto, PlayerDto, ProjectileDto } from './types';

export const isPlayerDto = (entity: EntityDto): entity is PlayerDto =>
  entity.type === EntityType.PLAYER;
export const isProjectileDto = (entity: EntityDto): entity is ProjectileDto =>
  entity.type === EntityType.PROJECTILE;
