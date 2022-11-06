import {
  EntityType,
  PROJECTILE_SIZE,
  PROJECTILE_HARD_FIELD_OF_VIEW,
  PROJECTILE_SOFT_FIELD_OF_VIEW
} from '@game/shared-domain';
import { Coordinates, Override } from '@game/shared-utils';
import { EntityOptions } from '../models/Entity';
import { Player } from '../models/Player';
import { Projectile } from '../models/Projectile';

export type CreateProjectileOptions = Override<
  Omit<EntityOptions, 'position' | 'dimensions' | 'type' | 'fieldOfView'>,
  { meta: { target: Coordinates }; parent: Player }
>;

export const createProjectile = ({
  id,
  world,
  meta,
  parent
}: CreateProjectileOptions) =>
  new Projectile({
    id,
    type: EntityType.PROJECTILE,
    world,
    parent,
    position: { ...parent.position },
    dimensions: { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE },
    fieldOfView: {
      hard: PROJECTILE_HARD_FIELD_OF_VIEW,
      soft: PROJECTILE_SOFT_FIELD_OF_VIEW
    },
    meta
  });
