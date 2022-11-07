import {
  EntityType,
  PROJECTILE_SIZE,
  PROJECTILE_HARD_FIELD_OF_VIEW,
  PROJECTILE_SOFT_FIELD_OF_VIEW
} from '@game/shared-domain';
import { Entity, EntityOptions } from '../models/Entity';
import { Projectile } from '../models/Projectile';

export type CreateProjectileOptions = Omit<
  EntityOptions,
  'position' | 'dimensions' | 'type' | 'fieldOfView'
> & { speed: number; parent: Entity };

export const createProjectile = ({
  id,
  world,
  parent,
  speed
}: CreateProjectileOptions) => {
  const projectile = new Projectile({
    id,
    type: EntityType.PROJECTILE,
    world,
    parent,
    position: { ...parent.position },
    dimensions: { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE },
    fieldOfView: {
      hard: PROJECTILE_HARD_FIELD_OF_VIEW,
      soft: PROJECTILE_SOFT_FIELD_OF_VIEW
    }
  });

  projectile.speed = speed;
  projectile.on('destroy', () => parent.children.delete(projectile));

  return projectile;
};
