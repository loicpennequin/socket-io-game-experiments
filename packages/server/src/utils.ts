import { EntityType } from '@game/domain';
import { Entity } from './factories/entityFactory';
import { Player } from './factories/playerFactory';
import { Projectile } from './factories/projectileFactory';

export const isPlayer = (entity: Entity): entity is Player =>
  entity.type === EntityType.PLAYER;
export const isProjectile = (entity: Entity): entity is Projectile =>
  entity.type === EntityType.PROJECTILE;
