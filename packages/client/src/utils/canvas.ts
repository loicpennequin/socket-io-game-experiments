import type { Coordinates, Dimensions } from '@game/shared-utils';

export const createCanvas = (dimensions: Dimensions) => {
  const canvas = Object.assign(document.createElement('canvas'), {
    width: dimensions.w,
    height: dimensions.h
  });

  return { canvas, ctx: canvas.getContext('2d') as CanvasRenderingContext2D };
};

export const pushPop = (ctx: CanvasRenderingContext2D, cb: () => void) => {
  ctx.save();
  cb();
  ctx.restore();
};

export const circle = (
  ctx: CanvasRenderingContext2D,
  { x, y, radius }: Coordinates & { radius: number }
) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.closePath();
};

export const fillRectCentered = (
  context: CanvasRenderingContext2D,
  { x, y, w, h }: Coordinates & Dimensions
) => {
  context.fillRect(x - w / 2, y - h / 2, w, h);
};
