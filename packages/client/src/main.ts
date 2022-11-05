import './style.css';

import { createGameRenderer } from './renderers/gameRenderer';
import { socket } from './utils/socket';

const mainEl = document.querySelector('main') as HTMLElement;
const gameRenderer = createGameRenderer({ id: 'game' });

mainEl.appendChild(gameRenderer.canvas);

socket.on('connect', () => {
  gameRenderer.start();
});
