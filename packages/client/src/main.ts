import './style.css';

import { createGameRenderer } from './renderers/gameRenderer';
import { createMinimapRenderer } from './renderers/minimapRenderer';
import { socket } from './utils/socket';

const mainEl = document.querySelector('main') as HTMLElement;

const gameRenderer = createGameRenderer({ id: 'game' });
const minimapRenderer = createMinimapRenderer({ id: 'minimap' });

mainEl.appendChild(gameRenderer.canvas);
mainEl.appendChild(Object.assign(minimapRenderer.canvas, { id: 'minimap' }));

socket.on('connect', () => {
  gameRenderer.start();
  minimapRenderer.start(); // ...
});
