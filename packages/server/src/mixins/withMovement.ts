import {
  Constructor,
  Coordinates,
  getAngleFromVector,
  Nullable
} from '@game/shared-utils';
import { Entity } from '../models/Entity';

export const withMovement = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class Movable extends Base {
    destination: Nullable<Coordinates>;
    speed = 0;

    move() {
      if (!this.destination) return;
      if (this.speed <= 0) return;

      const angle = getAngleFromVector({
        x: this.destination.x - this.position.x,
        y: this.destination.y - this.position.y
      });

      this.gridItem.position.x = this.position.x + Math.cos(angle) * this.speed;
      this.gridItem.position.y = this.position.y + Math.sin(angle) * this.speed;

      this.world.map.grid.update(this.gridItem);
    }
  };
};

export type Movable = ReturnType<typeof withMovement>;
