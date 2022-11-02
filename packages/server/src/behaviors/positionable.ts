import { Coordinates, AnyObject, Dimensions, pipeBuilder } from '@game/shared';

export type Positionable = {
  position: Coordinates;
};

export type Movable = {
  move: (to: Coordinates) => void;
};

export const withPosition = <T extends AnyObject>(
  obj: T,
  initialPosition: Coordinates = { x: 0, y: 0 }
): T & Positionable => ({ ...obj, position: initialPosition });

export const withMovement = <T extends Positionable>(obj: T): T & Movable =>
  Object.assign({}, obj, {
    move(to: Coordinates) {
      Object.assign(obj.position, to);
    }
  });
