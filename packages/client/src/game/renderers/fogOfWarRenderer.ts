import {
  EntityType,
  PLAYER_HARD_FIELD_OF_VIEW,
  PROJECTILE_HARD_FIELD_OF_VIEW
} from '@game/shared-domain';
import type { Coordinates, Dimensions } from '@game/shared-utils';
import type { GameState } from '../factories/gameState';
import { applyCamera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { socket } from '../../utils/socket';
import { pushPop } from '../../utils/canvas';
import { COLORS, FOG_OF_WAR_BLUR } from '../../utils/constants';

type CreateFogOfWarRendererOptions = {
  camera: Coordinates & Dimensions;
  getDimensions: () => Dimensions;
  id: string;
  scale?: number;
  state: GameState;
};

export const createFogOfWarRenderer = ({
  camera,
  getDimensions,
  id,
  state,
  scale = 1
}: CreateFogOfWarRendererOptions) => {
  const renderer = createRenderer({
    id,
    state,
    render: ({ canvas, ctx, state }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyCamera({ canvas, ctx, camera, state }, () => {
        ctx.fillStyle = COLORS.fogOfWar();
        ctx.fillRect(camera.x, camera.y, camera.w, camera.h);

        ctx.globalCompositeOperation = 'destination-out';

        const player = state.entitiesById[socket.id];
        if (!player) return;

        const entitiesToRender = [player.id, ...player.children]
          .map(id => state.interpolatedEntities[id])
          .filter(Boolean); // @fixme figure out why some entities are undefined sometimes

        pushPop(ctx, () => {
          ctx.scale(scale, scale);
          entitiesToRender.forEach(({ x, y, type }) => {
            const fov =
              type === EntityType.PLAYER
                ? PLAYER_HARD_FIELD_OF_VIEW
                : PROJECTILE_HARD_FIELD_OF_VIEW;

            const gradient = ctx.createRadialGradient(
              x,
              y,
              Math.max(0, fov - FOG_OF_WAR_BLUR * scale),
              x,
              y,
              fov
            );

            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - fov, y - fov, fov * 2, fov * 2);
          });
        });
      });
    },
    getDimensions
  });

  return {
    ...renderer,
    draw(ctx: CanvasRenderingContext2D, camera: Coordinates & Dimensions) {
      // avoid the fog of war crashing during HMR
      if (renderer.canvas.width === 0 || renderer.canvas.width === 0) return;

      ctx.drawImage(
        renderer.canvas,
        0,
        0,
        renderer.canvas.width,
        renderer.canvas.height,
        camera.x,
        camera.y,
        camera.w,
        camera.h
      );
    }
  };
};
