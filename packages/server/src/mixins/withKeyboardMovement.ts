import {
  clampToGrid,
  Directions,
  isWalkableTerrain
} from '@game/shared-domain';
import { Coordinates } from '@game/shared-utils';
import { Movable } from './withMovement';

export const withKeyboardMovement = <TBase extends Movable>(Base: TBase) => {
  return class KeyboardMovable extends Base {
    keyboardInput: Directions = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    protected get directionalDiff() {
      const diff = { x: 0, y: 0 };
      if (this.keyboardInput.up) diff.y -= this.speed;
      if (this.keyboardInput.down) diff.y += this.speed;
      if (this.keyboardInput.left) diff.x -= this.speed;
      if (this.keyboardInput.right) diff.x += this.speed;

      return diff;
    }

    private checkTerrainCollision(position: Coordinates) {
      return !isWalkableTerrain(this.world.map.getTerrainAtPosition(position));
    }

    handleKeyboardMovement(newDirection: Directions) {
      Object.assign(this.keyboardInput, newDirection);

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

      if (this.checkTerrainCollision(newPosition)) {
        this.angle = null;
        return;
      }
      this.moveTo(newPosition);
    }

    updatePosition() {
      if (this.checkTerrainCollision(this.nextPosition)) return;
      return super.updatePosition();
    }
  };
};

export type KeyboardMovable = ReturnType<typeof withKeyboardMovement>;
