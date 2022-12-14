import sprites from '@/assets/sprites/sprites';
import { createGameRenderer } from '../../game/renderers/gameRenderer';
import { socket } from '@/utils/socket';
import type { Renderer } from '../../game/factories/renderer';
import {
  GAME_OVER,
  JOIN_GAME,
  type JoinGamePayload
} from '@game/shared-domain';
import { state } from '../../game/factories/gameState';
import { noop } from '@game/shared-utils';

export type GameOptions = {
  gameContainer: HTMLElement;
  minimapContainer: HTMLElement;
  loginInfo: JoinGamePayload;
};

export type UseGameOptions = {
  onGameOver?: () => void;
};

export const useGame = (
  { onGameOver = noop }: UseGameOptions = { onGameOver: noop }
) => {
  let gameRenderer: Renderer;

  const start = ({
    gameContainer,
    minimapContainer,
    loginInfo
  }: GameOptions) => {
    gameContainer.innerHTML = '';
    minimapContainer.innerHTML = '';

    const assetPromise = Promise.all(
      Object.entries(sprites).map(
        ([key, { src }]) =>
          new Promise<[string, HTMLImageElement]>(resolve => {
            const image = new Image();
            image.src = src;
            image.addEventListener('load', () => resolve([key, image]));
          })
      )
    );

    const socketPromise = new Promise<void>(resolve => {
      socket.on('connect', () => {
        socket.emit(JOIN_GAME, loginInfo, () => resolve());
      });
    });

    socket.connect();

    return Promise.all([assetPromise, socketPromise]).then(([assets]) => {
      gameRenderer = createGameRenderer({
        id: 'game',
        assetMap: new Map(assets),
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
  };

  const stop = () => {
    gameRenderer?.pause();
    socket.disconnect();
  };

  socket.on(GAME_OVER, onGameOver);
  return { start, stop };
};
