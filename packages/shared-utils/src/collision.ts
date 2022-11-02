import { dist } from './math';
import { Coordinates, Dimensions } from './types';

export const pointRectCollision = (
  point: Coordinates,
  rect: Coordinates & Dimensions
) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.w &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.h;

export const pointCircleCollision = (
  point: Coordinates,
  circle: Coordinates & { r: number }
) => dist(point, circle) <= circle.r;
