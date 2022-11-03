import './style.css';

import { initKeyboardControls } from './keyboardControls';
import { createGameRenderer } from './gameRenderer';
import { displayDebugInfo } from './debug';
import { trackMousePosition } from './mouseTracker';
import { createMinimapRenderer } from './minimapRenderer';

const mainEl = document.querySelector('main') as HTMLElement;

initKeyboardControls();
trackMousePosition();

const gameRenderer = createGameRenderer();
const minimapRenderer = createMinimapRenderer();

mainEl.appendChild(gameRenderer.canvas);
mainEl.appendChild(Object.assign(minimapRenderer.canvas, { id: 'minimap' }));

gameRenderer.resume();
minimapRenderer.resume();

import.meta.env.VITE_DEBUG && displayDebugInfo();
