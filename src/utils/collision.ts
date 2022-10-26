import { Coordinates, Dimensions } from './index';

export const pointRectCollision = (
  point: Coordinates,
  rect: Coordinates & Dimensions
) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.w &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.h;
