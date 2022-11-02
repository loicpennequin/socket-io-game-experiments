import {
  Coordinates,
  EntityType,
  getAngleFromVector,
  PROJECTILE_FIELD_OF_VIEW,
  PROJECTILE_LIFESPAN,
  PROJECTILE_SIZE,
  PROJECTILE_SPEED
} from '@game/shared';
import { gameMap } from '../gameMap';
import { Entity, createEntity, MakeEntityOptions } from './entityFactory';
import { Player } from './playerFactory';

export type Projectile = Entity & {
  player: Player;
  lifeSpan: number;
  angle: number;
};

export type MakeProjectileOptions = Omit<
  MakeEntityOptions,
  'position' | 'dimensions' | 'type'
> & { player: Player; target: Coordinates };

export const createProjectile = ({
  player,
  target,
  id
}: MakeProjectileOptions): Projectile => {
  const entity = createEntity({
    id,
    type: EntityType.PROJECTILE,
    position: { ...player.position },
    dimensions: { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE }
  });

  console.log(entity.position);
  return Object.assign(entity, {
    player,
    angle: getAngleFromVector({
      x: target.x - player.gridItem.position.x,
      y: target.y - player.gridItem.position.y
    }),
    lifeSpan: PROJECTILE_LIFESPAN
  }).on('update', e => {
    const projectile = e as Projectile;
    Object.assign(projectile.gridItem.position, {
      x: projectile.position.x + Math.cos(projectile.angle) * PROJECTILE_SPEED,
      y: projectile.position.y + Math.sin(projectile.angle) * PROJECTILE_SPEED
    });

    const visibleCells = gameMap.getVisibleCells(
      entity.position,
      PROJECTILE_FIELD_OF_VIEW
    );

    for (const [key, cell] of visibleCells) {
      if (!projectile.player.allDiscoveredCells.has(key)) {
        projectile.player.allDiscoveredCells.set(key, cell);
        projectile.player.newDiscoveredCells.set(key, cell);
      }
    }

    gameMap.grid.update(entity.gridItem);

    projectile.lifeSpan--;

    if (projectile.lifeSpan <= 0) {
      entity.destroy();
    }
  }) as Projectile;
};
