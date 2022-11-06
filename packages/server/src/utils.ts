import { EntityType } from '@game/shared-domain';
import { Entity } from './models/Entity';
import { Player } from './models/Player';
import { Projectile } from './models/Projectile';

export const isPlayer = (entity: Entity): entity is Player =>
  entity.type === EntityType.PLAYER;
export const isProjectile = (entity: Entity): entity is Projectile =>
  entity.type === EntityType.PROJECTILE;
