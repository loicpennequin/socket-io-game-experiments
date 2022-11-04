import './style.css';

import { initKeyboardControls } from './utils/keyboardControls';
import { createGameRenderer } from './renderers/gameRenderer';
import { createDebugRenderer } from './renderers/debugRenderer';
import { trackMousePosition } from './utils/mouseTracker';
import { createMinimapRenderer } from './renderers/minimapRenderer';

const mainEl = document.querySelector('main') as HTMLElement;

initKeyboardControls();
trackMousePosition();

const gameRenderer = createGameRenderer({ id: 'game' });
const minimapRenderer = createMinimapRenderer({ id: 'minimap' });

mainEl.appendChild(gameRenderer.canvas);
mainEl.appendChild(Object.assign(minimapRenderer.canvas, { id: 'minimap' }));

gameRenderer.start();
minimapRenderer.start();

if (import.meta.env.VITE_DEBUG) {
  const debugRenderer = createDebugRenderer();
  debugRenderer.start();
}
