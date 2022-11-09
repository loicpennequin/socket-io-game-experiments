import humanoidsUrl from '@/assets/humanoids.png';
import magicalUrl from '@/assets/magical.png';
import { createGameRenderer } from '@/renderers/gameRenderer';
import { socket } from '@/utils/socket';
import type { Renderer } from '@/factories/renderer';
import { JOIN_GAME, type JoinGamePayload } from '@game/shared-domain';
import { state } from '@/stores/gameState';

export type GameOptions = {
  gameContainer: HTMLElement;
  minimapContainer: HTMLElement;
  loginInfo: JoinGamePayload;
};

export const useGame = () => {
  let gameRenderer: Renderer;

  const start = ({
    gameContainer,
    minimapContainer,
    loginInfo
  }: GameOptions) => {
    const assetPromise = Promise.all(
      [humanoidsUrl, magicalUrl].map(
        url =>
          new Promise<HTMLImageElement>(resolve => {
            const image = new Image();
            image.src = url;
            image.addEventListener('load', () => resolve(image));
          })
      )
    );

    const socketPromise = new Promise<void>(resolve => {
      socket.on('connect', () => {
        socket.emit(JOIN_GAME, loginInfo, () => resolve());
      });
    });

    Promise.all([assetPromise, socketPromise]).then(([assets]) => {
      gameRenderer = createGameRenderer({
        id: 'game',
        assets,
        state,
        getDimensions: () => {
          const { width, height } = gameContainer.getBoundingClientRect();

          return {
            w: width,
            h: height
          };
        },
        onStart({ canvas, children }) {
          gameContainer.appendChild(canvas);
          const minimapRenderer = children.find(
            renderer => renderer.id === 'minimap'
          );
          if (minimapRenderer) {
            minimapContainer.appendChild(minimapRenderer.canvas);
          }
        }
      });
      gameRenderer.start();
    });

    socket.connect();
  };

  const stop = () => {
    gameRenderer?.pause();
    socket.disconnect();
  };

  return { start, stop };
};
