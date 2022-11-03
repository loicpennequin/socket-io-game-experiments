import { PING } from '@game/shared-domain';
import { sum } from '@game/shared-utils';
import { socket } from './socket';

const FPS_BUFFER_MAX_LENGTH = 50;

export const displayDebugInfo = () => {
  const fps: number[] = [];
  let ping = 0;

  const debugEl = document.body.appendChild(
    Object.assign(document.createElement('div'), {
      id: 'debug-infos'
    })
  );

  let lastTick = 0;

  const render = () => {
    debugEl.innerHTML = /*html*/ `
      <div>FPS: ${Math.round(sum(...fps) / fps.length)}</div>
      <div>PING: ${Math.round(ping)}ms</div>
    `;
  };

  const updateFps = () => {
    if (lastTick) {
      const delta = (performance.now() - lastTick) / 1000;
      fps.push(Math.round(1 / delta));
      if (fps.length > FPS_BUFFER_MAX_LENGTH) fps.shift();
    }
    lastTick = performance.now();

    render();

    requestAnimationFrame(updateFps);
  };

  const updatePing = () => {
    socket.emit(PING, performance.now(), timestamp => {
      ping = performance.now() - timestamp;
      render();
    });
  };

  setInterval(updatePing, 5000);

  updateFps();
  updatePing();
};
