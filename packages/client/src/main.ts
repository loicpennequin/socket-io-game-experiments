import './style.css';

import { initKeyboardControls } from './keyboardControls';
import { createGameRenderer } from './gameRenderer';
import { displayDebugInfo } from './debug';

const mainEl = document.querySelector('main');

initKeyboardControls();

const rendererEl = mainEl!.appendChild(
  Object.assign(document.createElement('div'), {
    id: 'game-renderer'
  })
);

const playerRenderer = createGameRenderer();

rendererEl.appendChild(playerRenderer.canvas);
playerRenderer.resume();

import.meta.env.VITE_DEBUG && displayDebugInfo();
