import { Boundaries, Coordinates } from './index';

export const randomInRange = (a: number, b: number) => {
  return Math.random() * (b - a) + a;
};

export const lerp = (start: number, end: number, amount: number) => {
  return (1 - amount) * start + amount * end;
};

export const clamp = (num: number, { min, max }: Boundaries) =>
  Math.min(Math.max(num, min), max);

export const sat = (num: number) => {
  return Math.min(Math.max(num, 0.0), 1.0);
};

export const isInRange = (num: number, { min, max }: Boundaries) => {
  return num >= min && num <= max;
};

export const dist = (p1: Coordinates, p2: Coordinates) => {
  const diffX = p2.x - p1.x;
  const diffY = p2.y - p1.y;

  return Math.sqrt(diffX ** 2 + diffY ** 2);
};
