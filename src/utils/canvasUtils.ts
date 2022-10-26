import { Coordinates, Dimensions } from './index';

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

export const fillCircle = (
  ctx: CanvasRenderingContext2D,
  opts: Coordinates & { radius: number }
) => {
  circle(ctx, opts);

  ctx.fill();
};

export const fillRectCentered = (
  context: CanvasRenderingContext2D,
  { x, y, w, h }: Coordinates & Dimensions
) => {
  context.fillRect(x - w / 2, y - h / 2, w, h);
};
