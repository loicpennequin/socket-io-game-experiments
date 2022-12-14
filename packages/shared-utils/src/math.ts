/* eslint-disable camelcase */
import type { Boundaries, Coordinates, Range } from './types';

export const clamp = (num: number, { min, max }: Range) =>
  Math.min(Math.max(num, min), max);

export const mapRange = (num: number, inRange: Range, outRange: Range) => {
  const mapped: number =
    ((num - inRange.min) * (outRange.max - outRange.min)) /
      (inRange.max - inRange.min) +
    outRange.min;

  return clamp(mapped, { min: outRange.min, max: outRange.max });
};

export const smootherStep = (x: number) =>
  6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;

export const lerp = (num: number, { min, max }: Range) => {
  return min + smootherStep(num) * (max - min);
};

export const sat = (num: number) => clamp(num, { min: 0, max: 1 });

export const isInRange = (num: number, { min, max }: Boundaries) => {
  return num >= min && num <= max;
};

export const dist = (p1: Coordinates, p2: Coordinates) => {
  const diffX = Math.abs(p2.x - p1.x);
  const diffY = Math.abs(p2.y - p1.y);

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

export const addVector = (vec1: Coordinates, vec2: Coordinates) => ({
  x: vec1.x + vec2.x,
  y: vec1.y + vec2.y
});

export const clampVector = (
  { x, y }: Coordinates,
  { min, max }: Boundaries<Coordinates>
): Coordinates => ({
  x: clamp(x, { min: min.x, max: max.x }),
  y: clamp(y, { min: min.y, max: max.y })
});
