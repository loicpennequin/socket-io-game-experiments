import './style.css';

import { initControls } from './utils/controls';
import { createGameRenderer } from './renderers/gameRenderer';
import { trackMousePosition } from './utils/mouseTracker';
import { createMinimapRenderer } from './renderers/minimapRenderer';
import { socket } from './utils/socket';

const mainEl = document.querySelector('main') as HTMLElement;

const gameRenderer = createGameRenderer({ id: 'game' });
const minimapRenderer = createMinimapRenderer({ id: 'minimap' });

mainEl.appendChild(gameRenderer.canvas);
mainEl.appendChild(Object.assign(minimapRenderer.canvas, { id: 'minimap' }));

initControls();
trackMousePosition();

socket.on('connect', () => {
  gameRenderer.start();
  minimapRenderer.start(); // ...
});
