import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import type { Coordinates, Dimensions } from '@game/shared-utils';
import { applyCamera } from '../commands/applyCamera';
import { createRenderer, type RenderContext } from '../factories/renderer';
import { drawPlayersSprites } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { interpolateEntities, type GameState } from '../factories/gameState';
import { createCamera } from '../factories/camera';
import { socket } from '@/utils/socket';
import { createControls } from '../factories/controls';
import { trackMousePosition } from '@/utils/mouseTracker';
import { createMapRenderer } from './mapRenderer';
import { createDebugRenderer } from './debugRenderer';
import { createMinimapRenderer } from './minimapRenderer';
// import { createAssetMap } from '../factories/assetMap';
import { MapRenderMode } from '@/utils/enums';
import type { AssetMap } from '../factories/assetMap';

export type CreateGameRendererOptions = {
  id: string;
  assetMap: AssetMap;
  getDimensions: () => Dimensions;
  state: GameState;
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
  assetMap,
  getDimensions,
  onStart,
  state
}: CreateGameRendererOptions) => {
  const camera = createCamera({
    state,
    x: 0,
    y: 0,
    w: 0,
    h: 0
  });

  let mousePosition: Coordinates;
  // const assetMap = createAssetMap(assets, { baseSize: 32, gap: 4 });

  return createRenderer({
    id,
    getDimensions,
    state,

    children: [
      createMapRenderer({
        id: `map`,
        mode: MapRenderMode.DETAILED,
        state
      }),
      createFogOfWarRenderer({
        id: `fog-of-war`,
        camera,
        getDimensions,
        state
      }),
      createMinimapRenderer({
        id: 'minimap',
        camera,
        state
      }),
      createDebugRenderer(state)
    ],

    render: ({
      canvas,
      ctx,
      state,
      children: [mapRenderer, fogOfWarRenderer]
    }) => {
      interpolateEntities();
      camera.update();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx, camera, state }, () => {
        mapRenderer.draw?.(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE, state, assetMap });
        drawPlayersSprites({
          ctx,
          size: PLAYER_SIZE,
          assetMap,
          mousePosition,
          camera,
          state
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
      createControls({ canvas, camera, mousePosition });

      camera.setTarget(socket.id);
      camera.setCanvas(canvas);

      onStart?.(renderContext);
    }
  });
};
