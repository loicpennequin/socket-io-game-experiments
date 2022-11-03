import { pushPop } from '@/utils/canvas';
import { prevState, state } from '@/gameState';
import type { Boundaries, Coordinates, Dimensions } from '@game/shared-utils';
import { interpolate } from '@/utils/interpolate';

export type ApplyFieldOfViewOptions = {
  ctx: CanvasRenderingContext2D;
  entityId: string;
  fieldOfView: number;
};

export type FieldOfViewBoundaries = Boundaries<Coordinates> & Dimensions;

export const applyFieldOfView = (
  { ctx, entityId, fieldOfView }: ApplyFieldOfViewOptions,
  cb: (boundaries: FieldOfViewBoundaries) => void
) => {
  const player = state.entitiesById[entityId];
  if (!player) return;

  pushPop(ctx, () => {
    interpolate(player, prevState.entitiesById[player.id], entity => {
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, fieldOfView, fieldOfView, Math.PI * 2, true);
      ctx.clip();

      const boundaries: FieldOfViewBoundaries = {
        min: { x: entity.x - fieldOfView, y: entity.y - fieldOfView },
        max: { x: entity.x + fieldOfView, y: entity.y + fieldOfView },
        w: fieldOfView * 2,
        h: fieldOfView * 2
      };
      cb(boundaries);
    });
  });
};
