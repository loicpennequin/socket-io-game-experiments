import './style.css';

import { initKeyboardControls } from './keyboardControls';
import { createGameRenderer } from './gameRenderer';

initKeyboardControls();

const rendererEl = Object.assign(document.createElement('div'), {
  className: 'game-renderer'
});
const mainEl = document.querySelector('main');

const playerRenderer = createGameRenderer();

rendererEl.appendChild(playerRenderer.canvas);
mainEl?.appendChild(rendererEl);
playerRenderer.start();
