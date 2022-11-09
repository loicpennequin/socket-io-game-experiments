import { pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import type { Coordinates, Dimensions } from '@game/shared-utils';

export type DrawStatBarOptions = Coordinates &
  Dimensions & {
    ctx: CanvasRenderingContext2D;
    value: number;
    maxValue: number;
    color: string;
  };
export const drawStatBar = ({
  ctx,
  x,
  y,
  w,
  h,
  value,
  maxValue,
  color
}: DrawStatBarOptions) => {
  pushPop(ctx, () => {
    ctx.fillStyle = COLORS.statBarEmpty();
    ctx.fillRect(x, y, w, h);

    const remainingWidth = (value * w) / maxValue;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, remainingWidth, h);
    ctx.closePath();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  });
};
