import { pushPop } from '@/utils/canvas';
import type { Coordinates, Dimensions } from '@game/shared-utils';

export type DrawStatBarOptions = Coordinates &
  Dimensions & {
    ctx: CanvasRenderingContext2D;
    value: number;
    maxValue: number;
    barColor: string;
    bgColor: string;
  };
export const drawStatBar = ({
  ctx,
  x,
  y,
  w,
  h,
  value,
  maxValue,
  barColor,
  bgColor
}: DrawStatBarOptions) => {
  pushPop(ctx, () => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    const remainingWidth = (value * w) / maxValue;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, remainingWidth, h);
    ctx.closePath();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  });
};
