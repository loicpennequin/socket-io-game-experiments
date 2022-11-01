import { pushPop } from '@/utils/canvas';
import { prevState, state } from '@/gameState';
import { interpolateEntity, type EntityDto } from '@game/shared';

type ApplyFieldOfViewOptions = {
  ctx: CanvasRenderingContext2D;
  entityId: string;
  fieldOfView: number;
};

export const applyFieldOfView = (
  { ctx, entityId, fieldOfView }: ApplyFieldOfViewOptions,
  cb: () => void
) => {
  const player = state.entitiesById[entityId];
  if (!player) return;

  pushPop(ctx, () => {
    interpolateEntity<EntityDto>(
      { value: player, timestamp: state.timestamp },
      // prettier-ignore
      { value: prevState.entitiesById[player.id],timestamp: prevState.timestamp },
      entity => {
        ctx.beginPath();
        ctx.arc(
          entity.x,
          entity.y,
          fieldOfView,
          fieldOfView,
          Math.PI * 2,
          true
        );
        ctx.clip();
      }
    );

    cb();
  });
};
