import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import type { Coordinates, Dimensions } from '@game/shared-utils';
import { applyCamera } from '../commands/applyCamera';
import { createRenderer, type RenderContext } from '../factories/renderer';
import { drawPlayersSprites } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { interpolateEntities } from '@/stores/gameState';
import { createCamera } from '@/factories/camera';
import { socket } from '@/utils/socket';
import { initControls } from '@/utils/controls';
import { trackMousePosition } from '@/utils/mouseTracker';
import { handleManualCamera } from '@/commands/handleManualCamera';
import { createMapRenderer } from './mapRenderer';
import { createDebugRenderer } from './debugRenderer';
import { createMinimapRenderer } from './minimapRenderer';
import { createAssetMap } from '@/factories/assetMap';

export type CreateGameRendererOptions = {
  id: string;
  assets: HTMLImageElement[];
  getDimensions: () => Dimensions;
  onStart?: (ctx: RenderContext) => void;
};

export type Asset = {
  url: string;
  width: number;
  height: number;
};

export type DataUrl = string;

export const createGameRenderer = ({
  id,
  assets,
  getDimensions,
  onStart
}: CreateGameRendererOptions) => {
  const camera = createCamera({
    x: 0,
    y: 0,
    w: 0,
    h: 0
  });

  let mousePosition: Coordinates;
  const assetMap = createAssetMap(assets, { baseSize: 32, gap: 4 });

  const mapRenderer = createMapRenderer({
    id: `map`
  });

  return createRenderer({
    id,
    getDimensions,

    children: [
      mapRenderer,
      createFogOfWarRenderer({
        id: `fog-of-war`,
        camera,
        getDimensions
      }),
      createMinimapRenderer({
        id: 'minimap',
        camera,
        mapRenderer
      }),
      createDebugRenderer()
    ],

    render: ({ canvas, ctx, children: [mapRenderer, fogOfWarRenderer] }) => {
      interpolateEntities();
      handleManualCamera({ canvas, camera, mousePosition });
      camera.update();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx, camera }, () => {
        mapRenderer.draw?.(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        drawPlayersSprites({
          ctx,
          size: PLAYER_SIZE,
          assetMap,
          mousePosition,
          camera
        });

        fogOfWarRenderer.draw?.(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });
      });
    },

    async onStart(renderContext) {
      const { canvas } = renderContext;
      mousePosition = trackMousePosition(canvas);
      initControls(canvas, camera, mousePosition);

      camera.setTarget(socket.id);
      camera.setCanvas(canvas);

      onStart?.(renderContext);
    }
  });
};
