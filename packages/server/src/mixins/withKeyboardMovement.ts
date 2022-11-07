import { clampToGrid, Directions, WALKABLE_TERRAIN } from '@game/shared-domain';
import { Movable } from './withMovement';

export const withKeyboardMovement = <TBase extends Movable>(Base: TBase) => {
  return class KeyboardMovable extends Base {
    directions: Directions = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    protected get directionalDiff() {
      const diff = { x: 0, y: 0 };
      if (this.directions.up) diff.y -= this.speed;
      if (this.directions.down) diff.y += this.speed;
      if (this.directions.left) diff.x -= this.speed;
      if (this.directions.right) diff.x += this.speed;

      return diff;
    }

    updatePosition() {
      const newPosition = {
        x: clampToGrid(
          this.position.x + this.directionalDiff.x,
          this.dimensions.w
        ),
        y: clampToGrid(
          this.position.y + this.directionalDiff.y,
          this.dimensions.h
        )
      };
      const terrain = this.world.map.getTerrainAtPosition(newPosition);
      if (WALKABLE_TERRAIN.includes(terrain)) {
        this.moveTo(newPosition);
      }

      super.updatePosition();
    }
  };
};

export type KeyboardMovable = ReturnType<typeof withKeyboardMovement>;
