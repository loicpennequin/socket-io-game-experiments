/* eslint-disable camelcase */
import { createMatrix } from './helpers';
import type { Boundaries, Coordinates, Dimensions, Range } from './types';

export const smootherStep = (x: number) =>
  6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;

export const clamp = (num: number, { min, max }: Range) =>
  Math.min(Math.max(num, min), max);

export const mapRange = (num: number, inRange: Range, outRange: Range) => {
  const mapped: number =
    ((num - inRange.min) * (outRange.max - outRange.min)) /
      (inRange.max - inRange.min) +
    outRange.min;

  return clamp(mapped, { min: outRange.min, max: outRange.max });
};

export const lerp = (num: number, { min, max }: Range) => {
  return min + smootherStep(num) * (max - min);
  // return mapRange(smootherStep(num), { min: 0, max: 1 }, range);
};

export const sat = (num: number) => clamp(num, { min: 0, max: 1 });

export const isInRange = (num: number, { min, max }: Boundaries) => {
  return num >= min && num <= max;
};

export const dist = (p1: Coordinates, p2: Coordinates) => {
  const diffX = p2.x - p1.x;
  const diffY = p2.y - p1.y;

  return Math.sqrt(diffX ** 2 + diffY ** 2);
};

export const random = (max: number) => Math.random() * max;

export const randomInt = (max: number) => Math.round(random(max));

export const randomInRange = ({ min, max }: Boundaries) =>
  min + Math.random() * (max - min);

export const randomVector = (): Coordinates => {
  const angle = random(2 * Math.PI);

  return { x: Math.cos(angle), y: Math.sin(angle) };
};

export const dotProduct = (point1: Coordinates, point2: Coordinates) => {
  const vect = randomVector();

  return vect.x * (point1.x - point2.x) + vect.y * (point1.y - point2.y);
};

export const sum = (...nums: number[]) =>
  nums.reduce((total, num) => total + num, 0);

export const getAngleFromVector = ({ x, y }: Coordinates) => Math.atan2(y, x);

export const radToDegrees = (radians: number) => radians * (180 / Math.PI);

export const perlinMatrix = (dimensions: Dimensions) =>
  createMatrix(dimensions, ({ x, y }) => {
    const offset = {
      x: mapRange(x, { min: 0, max: dimensions.w }, { min: 0, max: 1 }),
      y: mapRange(y, { min: 0, max: dimensions.h }, { min: 0, max: 1 })
    };
    const boundaries = {
      x: {
        min: Math.floor(offset.x),
        max: Math.floor(offset.x) + 1
      },
      y: {
        min: Math.floor(offset.y),
        max: Math.floor(offset.y) + 1
      }
    };

    const minRange = {
      min: dotProduct(offset, { x: boundaries.x.min, y: boundaries.y.min }),
      max: dotProduct(offset, { x: boundaries.x.max, y: boundaries.y.min })
    };

    const maxRange = {
      min: dotProduct(offset, { x: boundaries.x.min, y: boundaries.y.max }),
      max: dotProduct(offset, { x: boundaries.x.max, y: boundaries.y.max })
    };

    const min = lerp(offset.x - boundaries.x.min, {
      min: minRange.min,
      max: minRange.max
    });

    const max = lerp(offset.x - boundaries.x.min, {
      min: maxRange.min,
      max: maxRange.max
    });

    return lerp(offset.y - boundaries.y.min, { min, max });
  });
