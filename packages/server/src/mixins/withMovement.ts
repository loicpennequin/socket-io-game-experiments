import {
  Constructor,
  Coordinates,
  getAngleFromVector,
  isDefined,
  Nullable
} from '@game/shared-utils';
import { Entity } from '../models/Entity';

export const withMovement = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class Movable extends Base {
    protected angle: Nullable<number>;
    speed = 0;

    moveTo({ x, y }: Coordinates) {
      if (this.position.x === x && this.position.y === y) {
        this.angle = null;
        return;
      }
      this.angle = getAngleFromVector({
        x: x - this.position.x,
        y: y - this.position.y
      });
    }

    updatePosition() {
      if (!isDefined(this.angle)) return;
      if (this.speed <= 0) return;

      this.gridItem.position.x =
        this.position.x + Math.cos(this.angle) * this.speed;
      this.gridItem.position.y =
        this.position.y + Math.sin(this.angle) * this.speed;

      this.world.map.grid.update(this.gridItem);
    }
  };
};

export type Movable = ReturnType<typeof withMovement>;
