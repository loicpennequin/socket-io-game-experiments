/* eslint-disable camelcase */
import {
  Boundaries,
  Coordinates,
  Range,
  createMatrix,
  Dimensions
} from './index';

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

export const lerp = (num: number, range: Range) =>
  mapRange(smootherStep(num), { min: 0, max: 1 }, range);

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

export const randomVector = (): Coordinates => {
  const angle = random(2 * Math.PI);

  return { x: Math.cos(angle), y: Math.sin(angle) };
};

export const dotProduct = (point1: Coordinates, point2: Coordinates) => {
  const vect = randomVector();

  return vect.x * (point1.x - point2.x) + vect.y * (point1.y - point2.y);
};

export const perlinMatrix = (dimensions: Dimensions) =>
  createMatrix(dimensions, ({ x, y }) => {
    const boundaries = {
      x: {
        min: Math.floor(x),
        max: Math.floor(x) + 1
      },
      y: {
        min: Math.floor(y),
        max: Math.floor(y) + 1
      }
    };

    const minRange = {
      min: dotProduct({ x, y }, { x: boundaries.x.min, y: boundaries.y.min }),
      max: dotProduct({ x, y }, { x: boundaries.x.max, y: boundaries.y.min })
    };

    const maxRange = {
      min: dotProduct({ x, y }, { x: boundaries.x.min, y: boundaries.y.max }),
      max: dotProduct({ x, y }, { x: boundaries.x.max, y: boundaries.y.max })
    };

    const min = lerp(x - boundaries.x.min, {
      min: minRange.min,
      max: minRange.max
    });

    const max = lerp(x - boundaries.x.min, {
      min: maxRange.min,
      max: maxRange.max
    });
    return lerp(y - boundaries.y.min, { min, max });
  });

export const nerdPerlin = {
  rand_vect: function () {
    const theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  },
  dot_prod_grid: function (x, y, vx, vy) {
    let g_vect;
    const d_vect = { x: x - vx, y: y - vy };
    // @ts-ignore
    if (this.gradients[[vx, vy]]) {
      // @ts-ignore
      g_vect = this.gradients[[vx, vy]];
    } else {
      g_vect = this.rand_vect();
      // @ts-ignore
      this.gradients[[vx, vy]] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  },
  smootherstep: function (x) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  },
  interp: function (x, a, b) {
    return a + this.smootherstep(x) * (b - a);
  },
  seed: function () {
    this.gradients = {};
    this.memory = {};
  },
  get: function (x: number, y: number) {
    // @ts-ignore
    // eslint-disable-next-line no-prototype-builtins
    if (this.memory.hasOwnProperty([x, y])) return this.memory[[x, y]];
    const xf = Math.floor(x);
    const yf = Math.floor(y);
    const tl = this.dot_prod_grid(x, y, xf, yf);
    const tr = this.dot_prod_grid(x, y, xf + 1, yf);
    const bl = this.dot_prod_grid(x, y, xf, yf + 1);
    const br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    const xt = this.interp(x - xf, tl, tr);
    const xb = this.interp(x - xf, bl, br);
    const v = this.interp(y - yf, xt, xb);
    // @ts-ignore
    this.memory[[x, y]] = v;
    return v;
  }
};
