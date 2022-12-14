import { EntityOrientation } from '@game/shared-domain';
import {
  addVector,
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
    protected movementTarget: Coordinates = { x: 0, y: 0 };
    speed = 0;
    orientation: EntityOrientation = EntityOrientation.RIGHT;

    moveTo({ x, y }: Coordinates) {
      if (this.position.x === x && this.position.y === y) {
        this.angle = null;
        return;
      }

      this.movementTarget = { x, y };

      this.updateOrientation({ x, y });
      this.angle = getAngleFromVector({
        x: x - this.position.x,
        y: y - this.position.y
      });
    }

    private updateOrientation({ x }: Coordinates) {
      if (this.position.x === x) return;

      this.orientation =
        x < this.position.x ? EntityOrientation.LEFT : EntityOrientation.RIGHT;

      // @fixme  need to rethink all this meta stuff, it's pretty stupid
      this.meta.orientation = this.orientation;
    }

    protected get nextPosition() {
      if (!isDefined(this.angle)) return this.position;

      return addVector(this.position, {
        x: Math.cos(this.angle) * this.speed,
        y: Math.sin(this.angle) * this.speed
      });
    }

    updatePosition() {
      if (this.speed <= 0) return;

      Object.assign(this.gridItem.position, this.nextPosition);

      this.world.map.grid.update(this.gridItem);
    }
  };
};

export type Movable = ReturnType<typeof withMovement>;
