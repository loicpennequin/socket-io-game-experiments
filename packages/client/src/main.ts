import './style.css';

import { initKeyboardControls } from './utils/keyboardControls';
import { createGameRenderer } from './renderers/gameRenderer';
import { displayDebugInfo } from './utils/debug';
import { trackMousePosition } from './utils/mouseTracker';
import { createMinimapRenderer } from './renderers/minimapRenderer';

const mainEl = document.querySelector('main') as HTMLElement;

initKeyboardControls();
trackMousePosition();

const gameRenderer = createGameRenderer();
const minimapRenderer = createMinimapRenderer();

mainEl.appendChild(gameRenderer.canvas);
mainEl.appendChild(Object.assign(minimapRenderer.canvas, { id: 'minimap' }));

gameRenderer.start();
minimapRenderer.start();

import.meta.env.VITE_DEBUG && displayDebugInfo();
