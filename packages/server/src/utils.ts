import { EntityType } from '@game/shared-domain';
import { Entity } from './factories/entity';
import { Player } from './factories/player';
import { Projectile } from './factories/projectile';

export const isPlayer = (entity: Entity): entity is Player =>
  entity.type === EntityType.PLAYER;
export const isProjectile = (entity: Entity): entity is Projectile =>
  entity.type === EntityType.PROJECTILE;
