import './style.css';
import humanoidsUrl from './assets/sprites.png';
import magicalUrl from './assets/sprites2.png';

import { createGameRenderer } from './renderers/gameRenderer';
import { socket } from './utils/socket';

const mainEl = document.querySelector('main') as HTMLElement;

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

const socketPromise = new Promise<void>(resolve =>
  socket.on('connect', resolve)
);

Promise.all([assetPromise, socketPromise]).then(([assets]) => {
  const gameRenderer = createGameRenderer({
    id: 'game',
    assets
  });
  mainEl.appendChild(gameRenderer.canvas);
  gameRenderer.start();
});
