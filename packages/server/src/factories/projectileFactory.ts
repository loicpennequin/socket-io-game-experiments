import {
  Coordinates,
  EntityType,
  getAngleFromVector,
  PROJECTILE_FIELD_OF_VIEW,
  PROJECTILE_LIFESPAN,
  PROJECTILE_SIZE,
  PROJECTILE_SPEED
} from '@game/shared';
import { mapController } from '../controllers/mapController';
import { Entity, makeEntity, MakeEntityOptions } from './entityFactory';
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

export const makeProjectile = ({
  player,
  target,
  id
}: MakeProjectileOptions): Projectile => {
  const entity = makeEntity({
    id,
    type: EntityType.PLAYER,
    position: { ...player.position },
    dimensions: { w: PROJECTILE_SIZE, h: PROJECTILE_SIZE }
  });

  return Object.assign(entity, {
    player,
    angle: getAngleFromVector({
      x: target.x - player.gridItem.position.x,
      y: target.y - player.gridItem.position.y
    }),
    lifeSpan: PROJECTILE_LIFESPAN,
    update() {
      Object.assign(entity.gridItem.position, {
        x: Math.cos(this.angle) * PROJECTILE_SPEED,
        y: Math.sin(this.angle) * PROJECTILE_SPEED
      });

      const visibleCells = mapController.getVisibleCells(
        entity.position,
        PROJECTILE_FIELD_OF_VIEW
      );

      for (const [key, cell] of visibleCells) {
        if (!this.player.allDiscoveredCells.has(key)) {
          this.player.allDiscoveredCells.set(key, cell);
          this.player.newDiscoveredCells.set(key, cell);
        }
      }

      mapController.grid.update(entity.gridItem);

      this.lifeSpan--;
    }
  });
};
