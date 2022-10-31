import './style.css';

import { initKeyboardControls } from './keyboardControls';
import { createMapRenderer } from './mapRenderer';

initKeyboardControls();

const rendererEl = Object.assign(document.createElement('div'), {
  className: 'game-renderer'
});
const mainEl = document.querySelector('main');

const mapRenderer = createMapRenderer();

rendererEl.appendChild(mapRenderer.canvas);
mainEl?.appendChild(rendererEl);
mapRenderer.start();
