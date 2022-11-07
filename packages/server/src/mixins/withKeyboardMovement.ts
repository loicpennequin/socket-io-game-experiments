import {
  clampToGrid,
  Directions,
  isWalkableTerrain
} from '@game/shared-domain';
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

    handleKeyboardMovement(newDirection: Directions) {
      Object.assign(this.keyboardInput, newDirection);
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
      if (isWalkableTerrain(terrain)) {
        this.moveTo(newPosition);
      } else {
        this.angle = null;
      }

      super.updatePosition();
    }
  };
};

export type KeyboardMovable = ReturnType<typeof withKeyboardMovement>;
