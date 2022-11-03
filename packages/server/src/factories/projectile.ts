import {
  EntityType,
  PROJECTILE_SIZE,
  PROJECTILE_FIELD_OF_VIEW,
  PROJECTILE_LIFESPAN,
  PROJECTILE_SPEED
} from '@game/shared-domain';
import { Coordinates, getAngleFromVector, Override } from '@game/shared-utils';
import { Entity, createEntity, MakeEntityOptions } from './entity';
import { Player } from './player';

export type Projectile = Override<
  Entity,
  {
    lifeSpan: number;
    angle: number;
    parent: Player;
  }
>;

export type MakeProjectileOptions = Override<
  Omit<MakeEntityOptions, 'position' | 'dimensions' | 'type' | 'fieldOfView'>,
  { target: Coordinates; parent: Player }
>;

export const createProjectile = ({
  target,
  id,
  world,
  parent
}: MakeProjectileOptions): Projectile => {
  const entity = createEntity({
    id,
    type: EntityType.PROJECTILE,
    world,
    parent,
    position: { ...parent.position },
    dimensions: { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE },
    fieldOfView: PROJECTILE_FIELD_OF_VIEW
  });

  return Object.assign(entity, {
    angle: getAngleFromVector({
      x: target.x - entity.position.x,
      y: target.y - entity.position.y
    }),
    lifeSpan: PROJECTILE_LIFESPAN
  }).on('update', e => {
    const projectile = e as Projectile;
    Object.assign(projectile.gridItem.position, {
      x: projectile.position.x + Math.cos(projectile.angle) * PROJECTILE_SPEED,
      y: projectile.position.y + Math.sin(projectile.angle) * PROJECTILE_SPEED
    });

    const visibleCells = world.map.getVisibleCells(
      entity.position,
      PROJECTILE_FIELD_OF_VIEW
    );

    const player = entity.parent as Player;
    for (const [key, cell] of visibleCells) {
      if (!player.allDiscoveredCells.has(key)) {
        player.allDiscoveredCells.set(key, cell);
        player.newDiscoveredCells.set(key, cell);
      }
    }

    world.map.grid.update(entity.gridItem);

    projectile.lifeSpan--;

    if (projectile.lifeSpan <= 0) {
      entity.destroy();
    }
  }) as Projectile;
};
